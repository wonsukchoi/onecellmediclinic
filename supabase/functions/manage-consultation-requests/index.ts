import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface ConsultationRequestData {
  action: 'list' | 'get' | 'update' | 'convert_to_appointment' | 'get_stats' | 'get_tracking' | 'add_tracking';
  consultationId?: number;
  patientEmail?: string;
  filters?: {
    status?: string;
    search?: string;
    provider?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  updates?: {
    status?: string;
    assignedProviderId?: number;
    responseNotes?: string;
    estimatedCostRange?: string;
    recommendedProcedures?: string[];
    followUpRequired?: boolean;
  };
  appointmentData?: {
    procedureId?: number;
    providerId?: number;
    preferredDate: string;
    preferredTime: string;
    appointmentType?: string;
    notes?: string;
  };
  trackingData?: {
    status: string;
    notes: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    if (req.method === "GET") {
      // Handle GET requests for user consultation requests
      const url = new URL(req.url);
      const patientEmail = url.searchParams.get('patientEmail');
      const consultationId = url.searchParams.get('id');

      if (consultationId) {
        // Get single consultation request
        const { data, error } = await supabaseClient
          .from('consultation_requests')
          .select(`
            *,
            assigned_provider:providers(
              id,
              full_name,
              title,
              specialization,
              profile_image_url,
              bio,
              consultation_fee
            )
          `)
          .eq('id', consultationId)
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, consultation: data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else if (patientEmail) {
        // Get user consultation requests
        const { data, error } = await supabaseClient
          .from('consultation_requests')
          .select(`
            *,
            assigned_provider:providers(
              id,
              full_name,
              title,
              specialization,
              profile_image_url
            )
          `)
          .eq('patient_email', patientEmail)
          .order('created_at', { ascending: false });

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, consultations: data || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "Patient email or consultation ID required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestData: ConsultationRequestData = await req.json();
    const { action, consultationId, filters, pagination, updates, appointmentData, trackingData } = requestData;

    switch (action) {
      case 'list': {
        let query = supabaseClient
          .from('consultation_requests')
          .select(`
            *,
            assigned_provider:providers(*)
          `);

        // Apply filters
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.search) {
          query = query.or(`patient_name.ilike.%${filters.search}%,patient_email.ilike.%${filters.search}%`);
        }
        if (filters?.provider) {
          query = query.eq('assigned_provider_id', filters.provider);
        }

        // Apply pagination
        if (pagination) {
          const { page, limit } = pagination;
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'update': {
        if (!consultationId || !updates) {
          return new Response(
            JSON.stringify({ success: false, error: "Consultation ID and updates required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get current user for tracking
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) {
          return new Response(
            JSON.stringify({ success: false, error: "Authentication required" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Prepare update data
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (updates.status) updateData.status = updates.status;
        if (updates.assignedProviderId) updateData.assigned_provider_id = updates.assignedProviderId;
        if (updates.responseNotes) updateData.response_notes = updates.responseNotes;
        if (updates.estimatedCostRange) updateData.estimated_cost_range = updates.estimatedCostRange;
        if (updates.recommendedProcedures) updateData.recommended_procedures = updates.recommendedProcedures;
        if (updates.followUpRequired !== undefined) updateData.follow_up_required = updates.followUpRequired;

        const { data, error } = await supabaseClient
          .from('consultation_requests')
          .update(updateData)
          .eq('id', consultationId)
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Add tracking entry
        await supabaseClient.from('consultation_tracking').insert([
          {
            consultation_request_id: consultationId,
            status: updates.status || 'updated',
            notes: updates.responseNotes || 'Consultation request updated',
            created_by: user.id,
            created_at: new Date().toISOString(),
          },
        ]);

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'convert_to_appointment': {
        if (!consultationId || !appointmentData?.preferredDate || !appointmentData?.preferredTime) {
          return new Response(
            JSON.stringify({ success: false, error: "Consultation ID, date and time required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get current user for tracking
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) {
          return new Response(
            JSON.stringify({ success: false, error: "Authentication required" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get consultation details
        const { data: consultation, error: consultationError } = await supabaseClient
          .from('consultation_requests')
          .select('*')
          .eq('id', consultationId)
          .single();

        if (consultationError || !consultation) {
          return new Response(
            JSON.stringify({ success: false, error: "Consultation not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Create appointment
        const { data: appointment, error: appointmentError } = await supabaseClient
          .from('appointments')
          .insert([
            {
              patient_name: consultation.patient_name,
              patient_email: consultation.patient_email,
              patient_phone: consultation.patient_phone,
              service_type: appointmentData.appointmentType || 'consultation',
              procedure_id: appointmentData.procedureId,
              provider_id: appointmentData.providerId || consultation.assigned_provider_id,
              preferred_date: appointmentData.preferredDate,
              preferred_time: appointmentData.preferredTime,
              notes: appointmentData.notes || consultation.concerns,
              status: 'pending',
              appointment_type: appointmentData.appointmentType || 'consultation',
              created_at: new Date().toISOString(),
            },
          ])
          .select('id')
          .single();

        if (appointmentError) {
          return new Response(
            JSON.stringify({ success: false, error: appointmentError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Update consultation status
        await supabaseClient
          .from('consultation_requests')
          .update({
            status: 'converted_to_appointment',
            follow_up_required: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', consultationId);

        // Add tracking entry
        await supabaseClient.from('consultation_tracking').insert([
          {
            consultation_request_id: consultationId,
            status: 'converted_to_appointment',
            notes: `Converted to appointment #${appointment.id}`,
            created_by: user.id,
            created_at: new Date().toISOString(),
          },
        ]);

        return new Response(
          JSON.stringify({ success: true, appointmentId: appointment.id }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'get_stats': {
        const [totalResult, newResult, inProgressResult, completedResult, urgentResult] = await Promise.all([
          supabaseClient.from('consultation_requests').select('*', { count: 'exact', head: true }),
          supabaseClient
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new'),
          supabaseClient
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .in('status', ['in_progress', 'reviewing', 'awaiting_response']),
          supabaseClient
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .in('status', ['completed', 'converted_to_appointment']),
          supabaseClient
            .from('consultation_requests')
            .select('*', { count: 'exact', head: true })
            .eq('urgency_level', 'high')
            .eq('status', 'new'),
        ]);

        return new Response(
          JSON.stringify({
            success: true,
            stats: {
              total: totalResult.count || 0,
              newRequests: newResult.count || 0,
              inProgress: inProgressResult.count || 0,
              completed: completedResult.count || 0,
              urgentRequests: urgentResult.count || 0,
            },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'get_tracking': {
        if (!consultationId) {
          return new Response(
            JSON.stringify({ success: false, error: "Consultation ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('consultation_tracking')
          .select(`
            id,
            status,
            notes,
            created_at,
            created_by
          `)
          .eq('consultation_request_id', consultationId)
          .order('created_at', { ascending: true });

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, tracking: data || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'add_tracking': {
        if (!consultationId || !trackingData) {
          return new Response(
            JSON.stringify({ success: false, error: "Consultation ID and tracking data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get current user for tracking
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        if (userError || !user) {
          return new Response(
            JSON.stringify({ success: false, error: "Authentication required" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient.from('consultation_tracking').insert([
          {
            consultation_request_id: consultationId,
            status: trackingData.status,
            notes: trackingData.notes,
            created_by: user.id,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
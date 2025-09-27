import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface AppointmentRequest {
  action: 'list' | 'get' | 'update' | 'cancel' | 'reschedule' | 'book';
  appointmentId?: number;
  patientEmail?: string;
  filters?: {
    status?: string;
    provider?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  appointmentData?: {
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    serviceType?: string;
    procedureId?: number;
    providerId?: number;
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
    status?: string;
    cancellationReason?: string;
    newDate?: string;
    newTime?: string;
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
      // Handle GET requests for listing user appointments
      const url = new URL(req.url);
      const patientEmail = url.searchParams.get('patientEmail');

      if (!patientEmail) {
        return new Response(
          JSON.stringify({ success: false, error: "Patient email required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: appointments, error } = await supabaseClient
        .from('appointments')
        .select(`
          *,
          procedures(
            id,
            name,
            duration_minutes,
            price_range
          ),
          providers(
            id,
            full_name,
            title,
            specialization
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
        JSON.stringify({ success: true, appointments: appointments || [] }),
        {
          status: 200,
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

    const requestData: AppointmentRequest = await req.json();
    const { action, appointmentId, filters, pagination, appointmentData } = requestData;

    switch (action) {
      case 'list': {
        let query = supabaseClient
          .from('appointments')
          .select('*');

        // Apply filters
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.provider) {
          query = query.eq('provider_id', filters.provider);
        }
        if (filters?.dateFrom) {
          query = query.gte('preferred_date', filters.dateFrom);
        }
        if (filters?.dateTo) {
          query = query.lte('preferred_date', filters.dateTo);
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
        if (!appointmentId || !appointmentData?.status) {
          return new Response(
            JSON.stringify({ success: false, error: "Appointment ID and status required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const updateData: any = { status: appointmentData.status };
        if (appointmentData.notes) updateData.notes = appointmentData.notes;

        const { data, error } = await supabaseClient
          .from('appointments')
          .update(updateData)
          .eq('id', appointmentId)
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

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'cancel': {
        if (!appointmentId) {
          return new Response(
            JSON.stringify({ success: false, error: "Appointment ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient
          .from('appointments')
          .update({
            status: 'cancelled',
            cancellation_reason: appointmentData?.cancellationReason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointmentId);

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
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'reschedule': {
        if (!appointmentId || !appointmentData?.newDate || !appointmentData?.newTime) {
          return new Response(
            JSON.stringify({ success: false, error: "Appointment ID, new date and time required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient
          .from('appointments')
          .update({
            preferred_date: appointmentData.newDate,
            preferred_time: appointmentData.newTime,
            provider_id: appointmentData.providerId,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointmentId);

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
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'book': {
        if (!appointmentData?.patientName || !appointmentData?.patientEmail ||
            !appointmentData?.serviceType || !appointmentData?.preferredDate ||
            !appointmentData?.preferredTime) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing required appointment data" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('appointments')
          .insert([
            {
              patient_name: appointmentData.patientName,
              patient_email: appointmentData.patientEmail,
              patient_phone: appointmentData.patientPhone,
              service_type: appointmentData.serviceType,
              procedure_id: appointmentData.procedureId,
              provider_id: appointmentData.providerId,
              preferred_date: appointmentData.preferredDate,
              preferred_time: appointmentData.preferredTime,
              notes: appointmentData.notes,
              status: 'pending'
            }
          ])
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

        return new Response(
          JSON.stringify({ success: true, data }),
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface ConsultationRequest {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  patientAge?: number;
  consultationType: string;
  procedureInterest?: string;
  concerns?: string;
  medicalHistory?: string;
  currentMedications?: string;
  preferredContactMethod?: string;
  urgencyLevel?: string;
  photos?: string[];
}

interface ConsultationResponse {
  success: boolean;
  consultation?: any;
  error?: string;
  trackingId?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create service role client for bypassing RLS when inserting consultation data
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create regular client with user auth for operations that need user context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestData: ConsultationRequest = await req.json();

    // Validate required fields
    const { patientName, patientEmail, consultationType } = requestData;
    if (!patientName || !patientEmail || !consultationType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: patientName, patientEmail, consultationType"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate age if provided
    if (requestData.patientAge && (requestData.patientAge < 18 || requestData.patientAge > 120)) {
      return new Response(
        JSON.stringify({ success: false, error: "Patient age must be between 18 and 120" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if there's an existing recent consultation request from the same email
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: recentRequests, error: checkError } = await supabaseClient
      .from('consultation_requests')
      .select('id, created_at')
      .eq('patient_email', patientEmail)
      .eq('status', 'new')
      .gte('created_at', oneDayAgo.toISOString())
      .limit(1);

    if (checkError) {
      console.error("Error checking recent requests:", checkError);
    } else if (recentRequests && recentRequests.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You have already submitted a consultation request in the last 24 hours. Please wait before submitting another request."
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine urgency level based on keywords in concerns
    let urgencyLevel = requestData.urgencyLevel || 'normal';
    if (requestData.concerns) {
      const urgentKeywords = ['urgent', 'emergency', 'pain', 'bleeding', 'infection', 'swelling'];
      const concernsLower = requestData.concerns.toLowerCase();
      if (urgentKeywords.some(keyword => concernsLower.includes(keyword))) {
        urgencyLevel = 'high';
      }
    }

    // Find the best provider match based on procedure interest
    let assignedProviderId = null;
    if (requestData.procedureInterest) {
      const { data: procedures } = await supabaseClient
        .from('procedures')
        .select(`
          id,
          procedure_providers!inner(
            provider_id,
            providers!inner(
              id,
              full_name,
              active
            )
          )
        `)
        .ilike('name', `%${requestData.procedureInterest}%`)
        .eq('active', true)
        .eq('procedure_providers.providers.active', true)
        .limit(1);

      if (procedures && procedures.length > 0) {
        assignedProviderId = procedures[0].procedure_providers[0]?.providers.id;
      }
    }

    // Create the consultation request
    const consultationData = {
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: requestData.patientPhone,
      patient_age: requestData.patientAge,
      consultation_type: consultationType,
      procedure_interest: requestData.procedureInterest,
      concerns: requestData.concerns,
      medical_history: requestData.medicalHistory,
      current_medications: requestData.currentMedications,
      preferred_contact_method: requestData.preferredContactMethod || 'email',
      urgency_level: urgencyLevel,
      photos: requestData.photos || [],
      assigned_provider_id: assignedProviderId,
      status: 'new',
      created_at: new Date().toISOString()
    };

    const { data: consultation, error: insertError } = await serviceRoleClient
      .from('consultation_requests')
      .insert([consultationData])
      .select(`
        *,
        assigned_provider:providers(
          id,
          full_name,
          title,
          specialization
        )
      `)
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create consultation request. Please try again."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create initial tracking entry
    const { data: trackingEntry } = await serviceRoleClient
      .from('consultation_tracking')
      .insert([{
        consultation_request_id: consultation.id,
        status: 'received',
        notes: 'Consultation request received and under review',
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    // Prepare response
    const response: ConsultationResponse = {
      success: true,
      consultation,
      trackingId: consultation.id
    };

    // Set estimated response time based on urgency
    let estimatedResponseTime = "2-3 business days";
    if (urgencyLevel === 'high') {
      estimatedResponseTime = "within 24 hours";
    } else if (urgencyLevel === 'low') {
      estimatedResponseTime = "3-5 business days";
    }

    console.log(`Consultation request #${consultation.id} created with ${urgencyLevel} priority. Expected response: ${estimatedResponseTime}`);

    // Here you could trigger notifications to staff based on urgency level
    if (urgencyLevel === 'high') {
      console.log(`HIGH PRIORITY consultation request #${consultation.id} requires immediate attention`);
    }

    return new Response(
      JSON.stringify({
        ...response,
        message: `Your consultation request has been received. We will respond ${estimatedResponseTime}.`,
        estimatedResponseTime
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* Example request body:
{
  "patientName": "Jane Smith",
  "patientEmail": "jane.smith@example.com",
  "patientPhone": "+1234567890",
  "patientAge": 32,
  "consultationType": "Cosmetic Surgery Consultation",
  "procedureInterest": "Breast Augmentation",
  "concerns": "Looking to increase breast size, currently 32A, would like to be 32C",
  "medicalHistory": "No major surgeries, no chronic conditions",
  "currentMedications": "Birth control pill",
  "preferredContactMethod": "email",
  "urgencyLevel": "normal",
  "photos": ["https://example.com/photo1.jpg"]
}

Example response:
{
  "success": true,
  "consultation": {
    "id": 456,
    "patient_name": "Jane Smith",
    "patient_email": "jane.smith@example.com",
    "consultation_type": "Cosmetic Surgery Consultation",
    "procedure_interest": "Breast Augmentation",
    "urgency_level": "normal",
    "status": "new",
    "assigned_provider": {
      "id": 2,
      "full_name": "Dr. Emily Johnson",
      "title": "Plastic Surgeon",
      "specialization": "Breast Surgery"
    },
    "created_at": "2024-02-10T14:30:00.000Z"
  },
  "trackingId": 456,
  "message": "Your consultation request has been received. We will respond 2-3 business days.",
  "estimatedResponseTime": "2-3 business days"
}
*/
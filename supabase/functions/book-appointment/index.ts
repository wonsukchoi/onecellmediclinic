import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface BookAppointmentRequest {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceType: string;
  procedureId?: number;
  providerId?: number;
  preferredDate: string;
  preferredTime: string;
  durationMinutes?: number;
  notes?: string;
  appointmentType?: string;
}

interface AppointmentResponse {
  success: boolean;
  appointment?: any;
  error?: string;
  confirmationCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const requestData: BookAppointmentRequest = await req.json();

    // Validate required fields
    const { patientName, patientEmail, serviceType, preferredDate, preferredTime } = requestData;
    if (!patientName || !patientEmail || !serviceType || !preferredDate || !preferredTime) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: patientName, patientEmail, serviceType, preferredDate, preferredTime"
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

    // Validate date is in the future
    const appointmentDate = new Date(`${preferredDate}T${preferredTime}`);
    const now = new Date();
    if (appointmentDate <= now) {
      return new Response(
        JSON.stringify({ success: false, error: "Appointment must be scheduled for a future date and time" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check provider availability if provider is specified
    if (requestData.providerId) {
      const { data: isAvailable, error: availabilityError } = await supabaseClient
        .rpc('check_provider_availability', {
          provider_id_param: requestData.providerId,
          requested_date: preferredDate,
          requested_time: preferredTime,
          duration_minutes_param: requestData.durationMinutes || 60
        });

      if (availabilityError) {
        console.error("Availability check error:", availabilityError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Error checking provider availability"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!isAvailable) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Selected time slot is not available. Please choose a different time."
          }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generate confirmation code
    const { data: confirmationCode } = await supabaseClient
      .rpc('generate_confirmation_code');

    // Create the appointment
    const appointmentData = {
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: requestData.patientPhone,
      service_type: serviceType,
      procedure_id: requestData.procedureId,
      provider_id: requestData.providerId,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      duration_minutes: requestData.durationMinutes || 60,
      appointment_type: requestData.appointmentType || 'consultation',
      notes: requestData.notes,
      confirmation_code: confirmationCode,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: appointment, error: insertError } = await supabaseClient
      .from('appointments')
      .insert([appointmentData])
      .select('*')
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create appointment. Please try again."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get provider information if applicable
    let providerInfo = null;
    if (requestData.providerId) {
      const { data: provider } = await supabaseClient
        .from('providers')
        .select('full_name, title, specialization')
        .eq('id', requestData.providerId)
        .single();
      providerInfo = provider;
    }

    // Get procedure information if applicable
    let procedureInfo = null;
    if (requestData.procedureId) {
      const { data: procedure } = await supabaseClient
        .from('procedures')
        .select('name, duration_minutes, price_range')
        .eq('id', requestData.procedureId)
        .single();
      procedureInfo = procedure;
    }

    // Prepare response with additional information
    const response: AppointmentResponse = {
      success: true,
      appointment: {
        ...appointment,
        provider: providerInfo,
        procedure: procedureInfo
      },
      confirmationCode: appointment.confirmation_code
    };

    // Here you could trigger email notifications, SMS, etc.
    // For now, we'll just log the confirmation
    console.log(`Appointment booked with confirmation code: ${appointment.confirmation_code}`);

    return new Response(
      JSON.stringify(response),
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
  "patientName": "John Doe",
  "patientEmail": "john.doe@example.com",
  "patientPhone": "+1234567890",
  "serviceType": "Consultation",
  "procedureId": 1,
  "providerId": 1,
  "preferredDate": "2024-02-15",
  "preferredTime": "14:00",
  "durationMinutes": 60,
  "appointmentType": "consultation",
  "notes": "First-time patient interested in rhinoplasty"
}

Example response:
{
  "success": true,
  "appointment": {
    "id": 123,
    "patient_name": "John Doe",
    "patient_email": "john.doe@example.com",
    "confirmation_code": "ABC12345",
    "status": "pending",
    "provider": {
      "full_name": "Dr. Jane Smith",
      "title": "Plastic Surgeon",
      "specialization": "Facial Surgery"
    },
    "procedure": {
      "name": "Rhinoplasty",
      "duration_minutes": 180,
      "price_range": "$6,000 - $10,000"
    }
  },
  "confirmationCode": "ABC12345"
}
*/
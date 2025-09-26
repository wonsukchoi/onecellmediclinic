import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  preferredContact?: string;
}

interface ContactFormResponse {
  success: boolean;
  submission?: any;
  error?: string;
  submissionId?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestData: ContactFormData = await req.json();

    // Validate required fields
    const { name, email, phone, serviceType, message } = requestData;
    if (!name || !email || !phone || !serviceType || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: name, email, phone, serviceType, message",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid phone number format",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Rate limiting: Check for recent submissions from same email (within 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentSubmissions, error: checkError } = await supabaseClient
      .from("contact_submissions")
      .select("id, created_at")
      .eq("email", email)
      .gte("created_at", oneHourAgo.toISOString())
      .limit(1);

    if (checkError) {
      console.error("Error checking recent submissions:", checkError);
    } else if (recentSubmissions && recentSubmissions.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "You have already submitted a contact form in the last hour. Please wait before submitting another request.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare contact submission data with proper field mapping (camelCase to snake_case)
    const submissionData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      service_type: serviceType.trim(),
      message: message.trim(),
      preferred_contact: requestData.preferredContact?.trim() || "email",
      status: "new",
      created_at: new Date().toISOString(),
    };

    // Insert the contact form submission
    const { data: submission, error: insertError } = await supabaseClient
      .from("contact_submissions")
      .insert([submissionData])
      .select("*")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to submit contact form. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare response
    const response: ContactFormResponse = {
      success: true,
      submission,
      submissionId: submission.id,
    };

    // Determine response time based on service type
    let expectedResponseTime = "2-3 business days";
    const urgentServices = ["emergency", "urgent", "consultation"];
    const serviceTypeLower = serviceType.toLowerCase();

    if (urgentServices.some((urgent) => serviceTypeLower.includes(urgent))) {
      expectedResponseTime = "within 24 hours";
    }

    console.log(
      `Contact form submission #${submission.id} received from ${email} for ${serviceType}. Expected response: ${expectedResponseTime}`
    );

    // Log high priority submissions
    if (expectedResponseTime === "within 24 hours") {
      console.log(
        `PRIORITY contact form submission #${submission.id} requires prompt attention`
      );
    }

    return new Response(
      JSON.stringify({
        ...response,
        message: `Your contact form has been submitted successfully. We will respond ${expectedResponseTime}.`,
        expectedResponseTime,
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
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface ProviderRequest {
  action: 'list' | 'get' | 'create' | 'update' | 'delete';
  providerId?: number;
  filters?: {
    search?: string;
    active?: boolean;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  providerData?: {
    full_name?: string;
    title?: string;
    specialization?: string;
    bio?: string;
    profile_image_url?: string;
    years_experience?: number;
    consultation_fee?: number;
    languages_spoken?: string[];
    certifications?: string[];
    education?: string[];
    active?: boolean;
    display_order?: number;
    contact_email?: string;
    contact_phone?: string;
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
      // Handle GET requests for public providers
      const { data, error } = await supabaseClient
        .from('providers')
        .select(`
          *,
          procedure_providers(
            procedures(
              id,
              name,
              slug
            )
          )
        `)
        .eq('active', true)
        .order('full_name');

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
        JSON.stringify({ success: true, providers: data || [] }),
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

    const requestData: ProviderRequest = await req.json();
    const { action, providerId, filters, pagination, providerData } = requestData;

    switch (action) {
      case 'list': {
        let query = supabaseClient
          .from('providers')
          .select('*');

        // Apply filters
        if (filters?.search) {
          query = query.ilike('full_name', `%${filters.search}%`);
        }
        if (filters?.active !== undefined) {
          query = query.eq('active', filters.active);
        }

        // Apply pagination
        if (pagination) {
          const { page, limit } = pagination;
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);
        }

        query = query.order('full_name', { ascending: true });

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

      case 'get': {
        if (!providerId) {
          return new Response(
            JSON.stringify({ success: false, error: "Provider ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('providers')
          .select(`
            *,
            procedure_providers(
              procedures(
                id,
                name,
                slug,
                description,
                duration_minutes,
                price_range
              )
            )
          `)
          .eq('id', providerId)
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
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'create': {
        if (!providerData?.full_name || !providerData?.title) {
          return new Response(
            JSON.stringify({ success: false, error: "Full name and title required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('providers')
          .insert([providerData])
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

      case 'update': {
        if (!providerId || !providerData) {
          return new Response(
            JSON.stringify({ success: false, error: "Provider ID and data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('providers')
          .update(providerData)
          .eq('id', providerId)
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

      case 'delete': {
        if (!providerId) {
          return new Response(
            JSON.stringify({ success: false, error: "Provider ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Don't actually delete, just deactivate for data integrity
        const { data, error } = await supabaseClient
          .from('providers')
          .update({ active: false })
          .eq('id', providerId)
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
          JSON.stringify({ success: true, message: "Provider deactivated successfully" }),
          {
            status: 200,
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
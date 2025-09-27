import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface GalleryItemRequest {
  action: 'list' | 'get' | 'create' | 'update' | 'delete';
  itemId?: number;
  filters?: {
    search?: string;
    procedureId?: number;
    providerId?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  itemData?: {
    title?: string;
    description?: string;
    image_url?: string;
    before_image_url?: string;
    after_image_url?: string;
    procedure_id?: number;
    provider_id?: number;
    patient_consent?: boolean;
    display_order?: number;
    featured?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
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
      // Handle GET requests for public gallery items
      const url = new URL(req.url);
      const featured = url.searchParams.get('featured');
      const procedureId = url.searchParams.get('procedureId');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = supabaseClient
        .from('gallery_items')
        .select(`
          *,
          procedure:procedures(*),
          provider:providers(*)
        `);

      // Apply filters for public view
      if (featured === 'true') {
        query = query.eq('featured', true);
      }
      if (procedureId) {
        query = query.eq('procedure_id', procedureId);
      }

      query = query
        .eq('patient_consent', true) // Only show items with patient consent
        .order('display_order', { ascending: true })
        .limit(limit);

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
        JSON.stringify({ success: true, items: data || [] }),
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

    const requestData: GalleryItemRequest = await req.json();
    const { action, itemId, filters, pagination, itemData } = requestData;

    switch (action) {
      case 'list': {
        let query = supabaseClient
          .from('gallery_items')
          .select(`
            *,
            procedure:procedures(*),
            provider:providers(*)
          `);

        // Apply filters
        if (filters?.search) {
          query = query.ilike('title', `%${filters.search}%`);
        }
        if (filters?.procedureId) {
          query = query.eq('procedure_id', filters.procedureId);
        }
        if (filters?.providerId) {
          query = query.eq('provider_id', filters.providerId);
        }

        // Apply pagination
        if (pagination) {
          const { page, limit } = pagination;
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);
        }

        query = query.order('display_order', { ascending: true });

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
        if (!itemId) {
          return new Response(
            JSON.stringify({ success: false, error: "Item ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('gallery_items')
          .select(`
            *,
            procedure:procedures(*),
            provider:providers(*)
          `)
          .eq('id', itemId)
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
        if (!itemData?.title || !itemData?.image_url) {
          return new Response(
            JSON.stringify({ success: false, error: "Title and image URL required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('gallery_items')
          .insert([{
            ...itemData,
            created_at: new Date().toISOString(),
          }])
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
        if (!itemId || !itemData) {
          return new Response(
            JSON.stringify({ success: false, error: "Item ID and data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('gallery_items')
          .update({
            ...itemData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId)
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
        if (!itemId) {
          return new Response(
            JSON.stringify({ success: false, error: "Item ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient
          .from('gallery_items')
          .delete()
          .eq('id', itemId);

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
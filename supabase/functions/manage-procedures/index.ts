import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface ProcedureRequest {
  action: 'list' | 'list_categories' | 'list_by_category' | 'get' | 'create' | 'update' | 'delete' | 'get_category';
  procedureId?: number;
  categoryId?: number;
  filters?: {
    search?: string;
    category?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  procedureData?: {
    name?: string;
    slug?: string;
    description?: string;
    detailed_description?: string;
    category_id?: number;
    duration_minutes?: number;
    price_range?: string;
    featured_image_url?: string;
    before_after_images?: string[];
    benefits?: string[];
    recovery_time?: string;
    preparation_instructions?: string;
    aftercare_instructions?: string;
    active?: boolean;
    display_order?: number;
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
      // Handle GET requests for public procedures and categories
      const url = new URL(req.url);
      const category = url.searchParams.get('category');

      if (category) {
        // Get procedures by category
        const { data, error } = await supabaseClient
          .from('procedures')
          .select(`
            *,
            procedure_categories(
              id,
              name,
              description
            ),
            procedure_providers(
              providers(
                id,
                full_name,
                title,
                specialization
              )
            )
          `)
          .eq('category_id', category)
          .eq('active', true)
          .order('display_order')
          .order('name');

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
          JSON.stringify({ success: true, procedures: data || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // Get all active procedures
        const { data, error } = await supabaseClient
          .from('procedures')
          .select(`
            *,
            procedure_categories(
              id,
              name,
              description
            ),
            procedure_providers(
              providers(
                id,
                full_name,
                title,
                specialization
              )
            )
          `)
          .eq('active', true)
          .order('display_order')
          .order('name');

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
          JSON.stringify({ success: true, procedures: data || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
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

    const requestData: ProcedureRequest = await req.json();
    const { action, procedureId, categoryId, filters, pagination, sort, procedureData } = requestData;

    switch (action) {
      case 'list': {
        let query = supabaseClient
          .from('procedures')
          .select(`
            *,
            category:procedure_categories(*)
          `);

        // Apply filters
        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
        if (filters?.category) {
          query = query.eq('category_id', filters.category);
        }

        // Apply sorting
        if (sort?.field) {
          query = query.order(sort.field, { ascending: sort.direction === 'asc' });
        } else {
          query = query.order('display_order', { ascending: true });
        }

        // Apply pagination
        if (pagination) {
          const { page, limit } = pagination;
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);
        }

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

      case 'list_categories': {
        const { data, error } = await supabaseClient
          .from('procedure_categories')
          .select(`
            *,
            procedures(
              id,
              name,
              slug,
              description,
              duration_minutes,
              price_range,
              featured_image_url
            )
          `)
          .eq('active', true)
          .eq('procedures.active', true)
          .order('display_order');

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
          JSON.stringify({ success: true, categories: data || [] }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'get_category': {
        if (!categoryId) {
          return new Response(
            JSON.stringify({ success: false, error: "Category ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('procedure_categories')
          .select('*')
          .eq('id', categoryId)
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
        if (!procedureData?.name || !procedureData?.category_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Name and category required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('procedures')
          .insert([procedureData])
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
        if (!procedureId || !procedureData) {
          return new Response(
            JSON.stringify({ success: false, error: "Procedure ID and data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('procedures')
          .update(procedureData)
          .eq('id', procedureId)
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
        if (!procedureId) {
          return new Response(
            JSON.stringify({ success: false, error: "Procedure ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient
          .from('procedures')
          .delete()
          .eq('id', procedureId);

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
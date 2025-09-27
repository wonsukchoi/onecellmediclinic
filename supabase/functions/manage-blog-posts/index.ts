import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface BlogPostRequest {
  action: 'list' | 'get' | 'create' | 'update' | 'delete' | 'list_all';
  postId?: number;
  slug?: string;
  limit?: number;
  filters?: {
    search?: string;
    published?: boolean;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  postData?: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featured_image_url?: string;
    published?: boolean;
    author_id?: string;
    tags?: string[];
    meta_title?: string;
    meta_description?: string;
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
      // Handle GET requests for public blog posts
      const url = new URL(req.url);
      const slug = url.searchParams.get('slug');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      if (slug) {
        // Get single blog post by slug
        const { data, error } = await supabaseClient
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
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
      } else {
        // Get list of published blog posts
        const { data, error } = await supabaseClient
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(limit);

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

    const requestData: BlogPostRequest = await req.json();
    const { action, postId, filters, pagination, postData } = requestData;

    switch (action) {
      case 'list_all': {
        let query = supabaseClient
          .from('blog_posts')
          .select('*');

        // Apply filters
        if (filters?.search) {
          query = query.ilike('title', `%${filters.search}%`);
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

      case 'get': {
        if (!postId) {
          return new Response(
            JSON.stringify({ success: false, error: "Post ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
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
        if (!postData?.title || !postData?.content) {
          return new Response(
            JSON.stringify({ success: false, error: "Title and content required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('blog_posts')
          .insert([postData])
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
        if (!postId || !postData) {
          return new Response(
            JSON.stringify({ success: false, error: "Post ID and data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('blog_posts')
          .update(postData)
          .eq('id', postId)
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
        if (!postId) {
          return new Response(
            JSON.stringify({ success: false, error: "Post ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient
          .from('blog_posts')
          .delete()
          .eq('id', postId);

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
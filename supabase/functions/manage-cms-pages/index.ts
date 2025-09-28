import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DynamicPage {
  id?: string
  title: string
  slug: string
  description?: string
  keywords?: string
  meta_title?: string
  meta_description?: string
  template_id?: string
  status?: 'draft' | 'published' | 'archived'
  featured_image?: string
  author_id?: string
  published_at?: string
  created_at?: string
  updated_at?: string
  view_count?: number
  seo_canonical_url?: string
  seo_og_image?: string
  custom_css?: string
  custom_js?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    let user = null
    if (token) {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser(token)
      user = authUser
    }

    const { action, params, data } = await req.json()

    switch (action) {
      case 'list': {
        const {
          page = 1,
          limit = 20,
          search,
          status,
          template,
          sort
        } = params || {}

        let query = supabaseClient
          .from('dynamic_pages')
          .select(`
            *,
            blocks:page_blocks(
              id, block_type, title, content, styles, sort_order, is_visible
            )
          `, { count: 'exact' })

        // Apply filters
        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,keywords.ilike.%${search}%`)
        }
        if (status) {
          query = query.eq('status', status)
        }
        if (template) {
          query = query.eq('template_id', template)
        }

        // Apply sorting
        if (sort) {
          query = query.order(sort.field, { ascending: sort.direction === 'asc' })
        } else {
          query = query.order('updated_at', { ascending: false })
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data: pages, error, count } = await query

        if (error) throw error

        const totalPages = Math.ceil((count || 0) / limit)

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              data: pages,
              total: count || 0,
              page,
              limit,
              totalPages
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'get': {
        const { id, slug } = params

        let query = supabaseClient
          .from('dynamic_pages')
          .select(`
            *,
            blocks:page_blocks(
              id, block_type, title, content, styles, sort_order, is_visible
            )
          `)

        if (id) {
          query = query.eq('id', id)
        } else if (slug) {
          const { data, error } = await supabaseClient
            .rpc('get_page_by_slug', { page_slug: slug })
            .single()

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        const { data: page, error } = await query.single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: page }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'create': {
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
            }
          )
        }

        const pageData = {
          ...data,
          author_id: user.id,
          published_at: data.status === 'published' ? new Date().toISOString() : null
        }

        const { data: page, error } = await supabaseClient
          .from('dynamic_pages')
          .insert(pageData)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: page }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'update': {
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
            }
          )
        }

        const { id } = params
        const updateData = { ...data }

        // Update published_at when status changes to published
        if (data.status === 'published') {
          updateData.published_at = new Date().toISOString()
        } else if (data.status === 'draft') {
          updateData.published_at = null
        }

        const { data: page, error } = await supabaseClient
          .from('dynamic_pages')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: page }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'delete': {
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
            }
          )
        }

        const { id } = params

        const { error } = await supabaseClient
          .from('dynamic_pages')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'increment_views': {
        const { slug } = params

        const { error } = await supabaseClient.rpc('increment_page_views', { page_slug: slug })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }
  } catch (error) {
    console.error('Error in manage-cms-pages function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
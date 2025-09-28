import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PageTemplate {
  id?: string
  name: string
  description?: string
  template_code: string
  css_classes?: string
  available_blocks?: string[]
  is_active?: boolean
  preview_image?: string
  created_at?: string
  updated_at?: string
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
          is_active
        } = params || {}

        let query = supabaseClient
          .from('page_templates')
          .select('*', { count: 'exact' })

        // Apply filters
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        }
        if (is_active !== undefined) {
          query = query.eq('is_active', is_active)
        }

        // Apply sorting
        query = query.order('name')

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data: templates, error, count } = await query

        if (error) throw error

        const totalPages = Math.ceil((count || 0) / limit)

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              data: templates,
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

      case 'active': {
        // Get only active templates for selection
        const { data: templates, error } = await supabaseClient
          .from('page_templates')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: templates }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'get': {
        const { id } = params

        const { data: template, error } = await supabaseClient
          .from('page_templates')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: template }),
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

        const { data: template, error } = await supabaseClient
          .from('page_templates')
          .insert(data)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: template }),
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

        const { data: template, error } = await supabaseClient
          .from('page_templates')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: template }),
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
          .from('page_templates')
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

      case 'toggle_active': {
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
            }
          )
        }

        const { id, is_active } = params

        const { data: template, error } = await supabaseClient
          .from('page_templates')
          .update({ is_active })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: template }),
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
    console.error('Error in manage-cms-templates function:', error)
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
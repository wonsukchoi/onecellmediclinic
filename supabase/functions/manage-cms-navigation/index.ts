import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HeaderNavigation {
  id?: string
  label: string
  url?: string
  page_id?: string
  nav_type?: 'link' | 'dropdown' | 'megamenu' | 'divider'
  parent_id?: string
  sort_order: number
  is_visible?: boolean
  icon_name?: string
  target_blank?: boolean
  css_classes?: string
  access_level?: string
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
      case 'hierarchy': {
        // Get navigation hierarchy for frontend display
        const { data: navigation, error } = await supabaseClient.rpc('get_navigation_hierarchy')

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: navigation }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'list': {
        const {
          page = 1,
          limit = 50,
          search,
          parent_id
        } = params || {}

        let query = supabaseClient
          .from('header_navigation')
          .select('*', { count: 'exact' })

        // Apply filters
        if (search) {
          query = query.ilike('label', `%${search}%`)
        }
        if (parent_id !== undefined) {
          if (parent_id === null) {
            query = query.is('parent_id', null)
          } else {
            query = query.eq('parent_id', parent_id)
          }
        }

        // Apply sorting
        query = query.order('sort_order')

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data: items, error, count } = await query

        if (error) throw error

        const totalPages = Math.ceil((count || 0) / limit)

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              data: items,
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

        const { data: navItem, error } = await supabaseClient
          .from('header_navigation')
          .insert(data)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: navItem }),
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

        const { data: navItem, error } = await supabaseClient
          .from('header_navigation')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: navItem }),
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
          .from('header_navigation')
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

      case 'reorder': {
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
            }
          )
        }

        const { items } = params

        if (!Array.isArray(items)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Items must be an array' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const promises = items.map(({ id, sort_order }: { id: string; sort_order: number }) =>
          supabaseClient.from('header_navigation').update({ sort_order }).eq('id', id)
        )

        await Promise.all(promises)

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
    console.error('Error in manage-cms-navigation function:', error)
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
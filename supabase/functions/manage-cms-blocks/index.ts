import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PageBlock {
  id?: string
  page_id: string
  block_type: 'text' | 'image' | 'video' | 'gallery' | 'cta' | 'spacer' | 'html'
  title?: string
  content: Record<string, any>
  styles?: Record<string, any>
  sort_order: number
  is_visible?: boolean
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
        const { page_id } = params

        if (!page_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Page ID is required' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const { data: blocks, error } = await supabaseClient
          .from('page_blocks')
          .select('*')
          .eq('page_id', page_id)
          .order('sort_order')

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: blocks }),
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

        const { page_id } = params
        const blockData = {
          ...data,
          page_id
        }

        const { data: block, error } = await supabaseClient
          .from('page_blocks')
          .insert(blockData)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: block }),
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

        const { data: block, error } = await supabaseClient
          .from('page_blocks')
          .update(data)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: block }),
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
          .from('page_blocks')
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

        const { block_ids } = params

        if (!Array.isArray(block_ids)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Block IDs must be an array' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const updates = block_ids.map((id: string, index: number) => ({
          id,
          data: { sort_order: index + 1 }
        }))

        const promises = updates.map(({ id, data }) =>
          supabaseClient.from('page_blocks').update(data).eq('id', id)
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
    console.error('Error in manage-cms-blocks function:', error)
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
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface Differentiator {
  id?: number
  title: string
  subtitle?: string
  description?: string
  icon?: string
  icon_url?: string
  stats_number?: string
  stats_label?: string
  background_color?: string
  text_color?: string
  order_index?: number
  active?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { method } = req
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    switch (method) {
      case 'GET': {
        if (id) {
          const { data, error } = await supabase
            .from('differentiators')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const active = url.searchParams.get('active') ?? 'true'

          let query = supabase
            .from('differentiators')
            .select('*')
            .eq('active', active === 'true')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false })

          const { data, error } = await query

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      case 'POST': {
        const body = await req.json() as Differentiator

        // Set default values
        if (!body.background_color) body.background_color = '#ffffff'
        if (!body.text_color) body.text_color = '#333333'
        if (!body.order_index) body.order_index = 0
        if (!body.active) body.active = true

        const { data, error } = await supabase
          .from('differentiators')
          .insert([body])
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        })
      }

      case 'PUT': {
        if (!id) {
          return new Response(JSON.stringify({ error: 'ID is required for update' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }

        const body = await req.json() as Partial<Differentiator>

        const { data, error } = await supabase
          .from('differentiators')
          .update(body)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'DELETE': {
        if (!id) {
          return new Response(JSON.stringify({ error: 'ID is required for delete' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }

        const { error } = await supabase
          .from('differentiators')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'PATCH': {
        const action = url.searchParams.get('action')

        if (action === 'reorder') {
          const { items } = await req.json() as { items: Array<{ id: number; order_index: number }> }

          const updates = items.map(item =>
            supabase
              .from('differentiators')
              .update({ order_index: item.order_index })
              .eq('id', item.id)
          )

          await Promise.all(updates)

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'toggle_active' && id) {
          // Get current active status
          const { data: current, error: fetchError } = await supabase
            .from('differentiators')
            .select('active')
            .eq('id', id)
            .single()

          if (fetchError) throw fetchError

          const { data, error } = await supabase
            .from('differentiators')
            .update({ active: !current.active })
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405
        })
    }
  } catch (error) {
    return handleDatabaseError(error, 'differentiators', 'manage-differentiators')
  }
})
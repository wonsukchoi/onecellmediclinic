import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface ClinicFeature {
  id?: number
  title: string
  description?: string
  icon_url?: string
  image_url?: string
  order_index?: number
  category?: string
  stats_number?: string
  stats_label?: string
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
            .from('clinic_features')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const category = url.searchParams.get('category')
          const active = url.searchParams.get('active') ?? 'true'

          let query = supabase
            .from('clinic_features')
            .select('*')
            .eq('active', active === 'true')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false })

          if (category && category !== 'all') {
            query = query.eq('category', category)
          }

          const { data, error } = await query

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      case 'POST': {
        const body = await req.json() as ClinicFeature

        const { data, error } = await supabase
          .from('clinic_features')
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

        const body = await req.json() as Partial<ClinicFeature>

        const { data, error } = await supabase
          .from('clinic_features')
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
          .from('clinic_features')
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
              .from('clinic_features')
              .update({ order_index: item.order_index })
              .eq('id', item.id)
          )

          await Promise.all(updates)

          return new Response(JSON.stringify({ success: true }), {
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
    return handleDatabaseError(error, 'clinic_features', 'manage-features')
  }
})
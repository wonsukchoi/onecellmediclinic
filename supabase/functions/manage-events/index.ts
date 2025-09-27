import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface EventBanner {
  id?: number
  title: string
  description?: string
  image_url?: string
  link_url?: string
  button_text?: string
  active?: boolean
  priority?: number
  start_date?: string
  end_date?: string
  target_audience?: string
  event_type?: string
  discount_percentage?: number
  registration_link?: string
  max_participants?: number
  participants_count?: number
  event_location?: string
  registration_deadline?: string
  terms_conditions?: string
  featured?: boolean
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
            .from('event_banners')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const event_type = url.searchParams.get('event_type')
          const featured = url.searchParams.get('featured')
          const active = url.searchParams.get('active') ?? 'true'
          const current_only = url.searchParams.get('current_only')

          let query = supabase
            .from('event_banners')
            .select('*')
            .eq('active', active === 'true')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })

          if (event_type && event_type !== 'all') {
            query = query.eq('event_type', event_type)
          }

          if (featured === 'true') {
            query = query.eq('featured', true)
          }

          if (current_only === 'true') {
            const now = new Date().toISOString()
            query = query.gte('end_date', now)
          }

          const { data, error } = await query

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      case 'POST': {
        const body = await req.json() as EventBanner

        // Set default values
        if (!body.participants_count) body.participants_count = 0
        if (!body.priority) body.priority = 0
        if (!body.event_type) body.event_type = 'promotion'

        const { data, error } = await supabase
          .from('event_banners')
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

        const body = await req.json() as Partial<EventBanner>

        const { data, error } = await supabase
          .from('event_banners')
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
          .from('event_banners')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'PATCH': {
        const action = url.searchParams.get('action')

        if (action === 'register' && id) {
          const { error } = await supabase.rpc('increment_event_participants', {
            event_id: parseInt(id)
          })

          if (error) {
            return new Response(JSON.stringify({ error: 'Registration failed', details: error.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            })
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'analytics' && id) {
          // Get event analytics
          const { data: eventData, error: eventError } = await supabase
            .from('event_banners')
            .select('*')
            .eq('id', id)
            .single()

          if (eventError) throw eventError

          const analytics = {
            event: eventData,
            registration_rate: eventData.max_participants
              ? (eventData.participants_count / eventData.max_participants) * 100
              : 0,
            days_remaining: eventData.end_date
              ? Math.ceil((new Date(eventData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null,
            is_active: eventData.active && (!eventData.end_date || new Date(eventData.end_date) > new Date()),
            available_spots: eventData.max_participants
              ? eventData.max_participants - eventData.participants_count
              : null
          }

          return new Response(JSON.stringify(analytics), {
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
    return handleDatabaseError(error, 'event_banners', 'manage-events')
  }
})
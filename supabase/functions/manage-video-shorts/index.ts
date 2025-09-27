import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface VideoShort {
  id?: number
  title: string
  video_url: string
  thumbnail_url?: string
  description?: string
  category?: string
  featured?: boolean
  order_index?: number
  duration_seconds?: number
  tags?: string[]
  active?: boolean
}

serve(async (req) => {
  // Handle CORS preflight request
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
          // Get single video short
          const { data, error } = await supabase
            .from('video_shorts')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get all video shorts with optional filtering
          const category = url.searchParams.get('category')
          const featured = url.searchParams.get('featured')
          const active = url.searchParams.get('active') ?? 'true'

          let query = supabase
            .from('video_shorts')
            .select('*')
            .eq('active', active === 'true')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false })

          if (category && category !== 'all') {
            query = query.eq('category', category)
          }

          if (featured === 'true') {
            query = query.eq('featured', true)
          }

          const { data, error } = await query

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      case 'POST': {
        const body = await req.json() as VideoShort

        const { data, error } = await supabase
          .from('video_shorts')
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

        const body = await req.json() as Partial<VideoShort>

        const { data, error } = await supabase
          .from('video_shorts')
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
          .from('video_shorts')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'PATCH': {
        // Special endpoints for specific actions
        const action = url.searchParams.get('action')

        if (action === 'increment_views' && id) {
          const { error } = await supabase.rpc('increment_video_view_count', {
            video_id: parseInt(id),
            video_type: 'shorts'
          })

          if (error) throw error

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'reorder') {
          const { items } = await req.json() as { items: Array<{ id: number; order_index: number }> }

          const updates = items.map(item =>
            supabase
              .from('video_shorts')
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
    return handleDatabaseError(error, 'video_shorts', 'manage-video-shorts')
  }
})
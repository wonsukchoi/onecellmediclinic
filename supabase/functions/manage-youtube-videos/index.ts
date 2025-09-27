import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface YouTubeVideo {
  id?: number
  title: string
  youtube_id: string
  description?: string
  category?: string
  featured?: boolean
  view_count?: number
  order_index?: number
  thumbnail_url?: string
  duration_seconds?: number
  published_at?: string
  tags?: string[]
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
            .from('youtube_videos')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const category = url.searchParams.get('category')
          const featured = url.searchParams.get('featured')
          const active = url.searchParams.get('active') ?? 'true'

          let query = supabase
            .from('youtube_videos')
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
        const body = await req.json() as YouTubeVideo

        // Auto-fetch YouTube video details if not provided
        if (body.youtube_id && (!body.thumbnail_url || !body.duration_seconds)) {
          try {
            const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
            if (youtubeApiKey) {
              const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${body.youtube_id}&key=${youtubeApiKey}&part=snippet,contentDetails`
              )
              const data = await response.json()

              if (data.items && data.items.length > 0) {
                const video = data.items[0]
                if (!body.thumbnail_url) {
                  body.thumbnail_url = video.snippet.thumbnails.maxres?.url ||
                                     video.snippet.thumbnails.high?.url ||
                                     video.snippet.thumbnails.medium?.url
                }
                if (!body.duration_seconds) {
                  const duration = video.contentDetails.duration
                  // Parse ISO 8601 duration (PT4M13S -> 253 seconds)
                  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
                  if (match) {
                    const hours = parseInt(match[1]) || 0
                    const minutes = parseInt(match[2]) || 0
                    const seconds = parseInt(match[3]) || 0
                    body.duration_seconds = hours * 3600 + minutes * 60 + seconds
                  }
                }
                if (!body.published_at) {
                  body.published_at = video.snippet.publishedAt
                }
                if (!body.description) {
                  body.description = video.snippet.description?.substring(0, 500)
                }
              }
            }
          } catch (error) {
            console.warn('Could not fetch YouTube video details:', error)
          }
        }

        // Set default values
        if (!body.view_count) body.view_count = 0
        if (!body.order_index) body.order_index = 0
        if (!body.category) body.category = 'general'

        const { data, error } = await supabase
          .from('youtube_videos')
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

        const body = await req.json() as Partial<YouTubeVideo>

        const { data, error } = await supabase
          .from('youtube_videos')
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
          .from('youtube_videos')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'PATCH': {
        const action = url.searchParams.get('action')

        if (action === 'increment_views' && id) {
          const { error } = await supabase.rpc('increment_video_view_count', {
            video_id: parseInt(id),
            video_type: 'youtube'
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
              .from('youtube_videos')
              .update({ order_index: item.order_index })
              .eq('id', item.id)
          )

          await Promise.all(updates)

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'refresh_details' && id) {
          // Refresh video details from YouTube API
          const { data: video, error: videoError } = await supabase
            .from('youtube_videos')
            .select('youtube_id')
            .eq('id', id)
            .single()

          if (videoError) throw videoError

          try {
            const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
            if (!youtubeApiKey) {
              return new Response(JSON.stringify({ error: 'YouTube API key not configured' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
              })
            }

            const response = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?id=${video.youtube_id}&key=${youtubeApiKey}&part=snippet,contentDetails,statistics`
            )
            const data = await response.json()

            if (data.items && data.items.length > 0) {
              const videoData = data.items[0]
              const updateData: any = {
                title: videoData.snippet.title,
                description: videoData.snippet.description?.substring(0, 500),
                thumbnail_url: videoData.snippet.thumbnails.maxres?.url ||
                              videoData.snippet.thumbnails.high?.url ||
                              videoData.snippet.thumbnails.medium?.url,
                published_at: videoData.snippet.publishedAt
              }

              // Parse duration
              const duration = videoData.contentDetails.duration
              const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
              if (match) {
                const hours = parseInt(match[1]) || 0
                const minutes = parseInt(match[2]) || 0
                const seconds = parseInt(match[3]) || 0
                updateData.duration_seconds = hours * 3600 + minutes * 60 + seconds
              }

              const { data: updatedVideo, error } = await supabase
                .from('youtube_videos')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

              if (error) throw error

              return new Response(JSON.stringify(updatedVideo), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }
          } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to refresh video details' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            })
          }
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
    return handleDatabaseError(error, 'youtube_videos', 'manage-youtube-videos')
  }
})
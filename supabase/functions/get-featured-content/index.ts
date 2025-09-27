import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError, isMissingTableError, createMissingResourceResponse } from '../_shared/error-handler.ts'

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

    if (method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      })
    }

    // Check if we want to use the database function or manual queries
    const useFunction = url.searchParams.get('use_function') === 'true'

    if (useFunction) {
      // Use the database function
      const { data, error } = await supabase.rpc('get_featured_content')

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      // Manual queries for more control
      const [
        videoShortsResult,
        clinicFeaturesResult,
        eventsResult,
        selfieReviewsResult,
        youtubeVideosResult,
        differentiatorsResult
      ] = await Promise.all([
        // Video Shorts
        supabase
          .from('video_shorts')
          .select('id, title, video_url, thumbnail_url, description, view_count, category')
          .eq('featured', true)
          .eq('active', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(6),

        // Clinic Features
        supabase
          .from('clinic_features')
          .select('id, title, description, icon_url, image_url, category, stats_number, stats_label')
          .eq('active', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(8),

        // Events
        supabase
          .from('event_banners')
          .select('id, title, description, image_url, event_type, discount_percentage, end_date, registration_link, max_participants, participants_count')
          .eq('active', true)
          .eq('featured', true)
          .gte('end_date', new Date().toISOString())
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(4),

        // Selfie Reviews
        supabase
          .from('selfie_reviews')
          .select('id, patient_initial, procedure_type, selfie_url, review_text, rating, treatment_date')
          .eq('verified', true)
          .eq('featured', true)
          .eq('consent_given', true)
          .eq('moderation_status', 'approved')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(6),

        // YouTube Videos
        supabase
          .from('youtube_videos')
          .select('id, title, youtube_id, description, category, view_count, thumbnail_url')
          .eq('featured', true)
          .eq('active', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(4),

        // Differentiators
        supabase
          .from('differentiators')
          .select('id, title, subtitle, description, icon, icon_url, stats_number, stats_label, background_color, text_color')
          .eq('active', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(6)
      ])

      // Check for errors - handle missing tables gracefully
      const errors = [
        videoShortsResult.error,
        clinicFeaturesResult.error,
        eventsResult.error,
        selfieReviewsResult.error,
        youtubeVideosResult.error,
        differentiatorsResult.error
      ].filter(Boolean)

      // If we have missing table errors, return a helpful response
      const missingTableErrors = errors.filter(isMissingTableError)
      if (missingTableErrors.length > 0) {
        return createMissingResourceResponse('multiple tables (video_shorts, clinic_features, event_banners, selfie_reviews, youtube_videos, differentiators)')
      }

      // If we have other database errors, throw the first one
      if (errors.length > 0) {
        throw errors[0]
      }

      const result = {
        video_shorts: videoShortsResult.data || [],
        clinic_features: clinicFeaturesResult.data || [],
        events: eventsResult.data || [],
        selfie_reviews: selfieReviewsResult.data || [],
        youtube_videos: youtubeVideosResult.data || [],
        differentiators: differentiatorsResult.data || []
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    return handleDatabaseError(error, 'get_featured_content function', 'get-featured-content')
  }
})
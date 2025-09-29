import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, pageId, analytics, params } = await req.json()

    // Create Supabase client with service role key for analytics operations
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    })

    switch (action) {
      case 'track_page_view': {
        // Track a page view
        if (!pageId) {
          throw new Error('Page ID is required')
        }

        const { error } = await supabaseClient
          .from('page_analytics')
          .insert({
            page_id: pageId,
            ...analytics
          })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_page_analytics': {
        // Get analytics for a specific page
        if (!pageId) {
          throw new Error('Page ID is required')
        }

        const { from, to } = params || {}

        let query = supabaseClient
          .from('page_analytics')
          .select('*')
          .eq('page_id', pageId)

        if (from) {
          query = query.gte('visited_at', from)
        }
        if (to) {
          query = query.lte('visited_at', to)
        }

        const { data, error } = await query

        if (error) throw error

        // Calculate analytics metrics
        const views = data?.length || 0
        const unique_visitors = new Set(data?.map(a => a.visitor_ip) || []).size
        const avg_time_on_page = data?.reduce((sum, a) => sum + (a.time_on_page || 0), 0) / views || 0
        const bounce_rate = (data?.filter(a => a.bounce).length / views) * 100 || 0

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              views,
              unique_visitors,
              avg_time_on_page,
              bounce_rate
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_global_analytics': {
        // Get global analytics across all pages
        const { from, to } = params || {}

        let query = supabaseClient
          .from('page_analytics')
          .select('*')

        if (from) {
          query = query.gte('visited_at', from)
        }
        if (to) {
          query = query.lte('visited_at', to)
        }

        const { data, error } = await query

        if (error) throw error

        // Calculate global analytics
        const totalViews = data?.length || 0
        const uniqueVisitors = new Set(data?.map(a => a.visitor_ip) || []).size
        const avgTimeOnPage = data?.reduce((sum, a) => sum + (a.time_on_page || 0), 0) / totalViews || 0
        const bounceRate = (data?.filter(a => a.bounce).length / totalViews) * 100 || 0

        // Get page-specific analytics
        const pageStats = data?.reduce((acc, item) => {
          if (!acc[item.page_id]) {
            acc[item.page_id] = {
              views: 0,
              unique_visitors: new Set(),
              total_time: 0,
              bounces: 0
            }
          }
          acc[item.page_id].views++
          acc[item.page_id].unique_visitors.add(item.visitor_ip)
          acc[item.page_id].total_time += item.time_on_page || 0
          if (item.bounce) acc[item.page_id].bounces++
          return acc
        }, {} as Record<string, any>) || {}

        // Convert page stats to final format
        const pageAnalytics = Object.entries(pageStats).map(([pageId, stats]) => ({
          page_id: pageId,
          views: stats.views,
          unique_visitors: stats.unique_visitors.size,
          avg_time_on_page: stats.total_time / stats.views,
          bounce_rate: (stats.bounces / stats.views) * 100
        }))

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              global: {
                totalViews,
                uniqueVisitors,
                avgTimeOnPage,
                bounceRate
              },
              pages: pageAnalytics
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_popular_pages': {
        // Get most popular pages
        const { limit = 10, from, to } = params || {}

        let query = supabaseClient
          .from('page_analytics')
          .select('page_id')

        if (from) {
          query = query.gte('visited_at', from)
        }
        if (to) {
          query = query.lte('visited_at', to)
        }

        const { data, error } = await query

        if (error) throw error

        // Count views per page
        const pageCounts = data?.reduce((acc, item) => {
          acc[item.page_id] = (acc[item.page_id] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        // Sort and limit results
        const popularPages = Object.entries(pageCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([pageId, views]) => ({ page_id: pageId, views }))

        return new Response(
          JSON.stringify({
            success: true,
            data: popularPages
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_visitor_metrics': {
        // Get visitor-related metrics
        const { from, to } = params || {}

        let query = supabaseClient
          .from('page_analytics')
          .select('visitor_ip, user_agent, referrer, visited_at')

        if (from) {
          query = query.gte('visited_at', from)
        }
        if (to) {
          query = query.lte('visited_at', to)
        }

        const { data, error } = await query

        if (error) throw error

        // Analyze visitor patterns
        const uniqueVisitors = new Set(data?.map(a => a.visitor_ip) || []).size
        const totalSessions = data?.length || 0

        // Browser analysis (simplified)
        const browsers = data?.reduce((acc, item) => {
          const userAgent = item.user_agent || 'Unknown'
          let browser = 'Other'
          if (userAgent.includes('Chrome')) browser = 'Chrome'
          else if (userAgent.includes('Firefox')) browser = 'Firefox'
          else if (userAgent.includes('Safari')) browser = 'Safari'
          else if (userAgent.includes('Edge')) browser = 'Edge'

          acc[browser] = (acc[browser] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        // Referrer analysis
        const referrers = data?.reduce((acc, item) => {
          const referrer = item.referrer || 'Direct'
          acc[referrer] = (acc[referrer] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              uniqueVisitors,
              totalSessions,
              returnVisitorRate: uniqueVisitors > 0 ? ((totalSessions - uniqueVisitors) / totalSessions) * 100 : 0,
              browsers,
              referrers
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'validate_slug': {
        // Validate if a slug is unique (for CMS)
        const { slug, excludeId } = params || {}

        if (!slug) {
          throw new Error('Slug is required')
        }

        let query = supabaseClient
          .from('dynamic_pages')
          .select('id')
          .eq('slug', slug)

        if (excludeId) {
          query = query.neq('id', excludeId)
        }

        const { data, error } = await query

        if (error) throw error

        const isUnique = (data?.length || 0) === 0

        return new Response(
          JSON.stringify({
            success: true,
            data: { isUnique }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error in analytics-operations function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
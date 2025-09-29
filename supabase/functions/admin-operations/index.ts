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
    const { action, table, id, data, params } = await req.json()

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    })

    // Get JWT from Authorization header for user authentication
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Verify the JWT token to get user info
    let currentUser = null
    if (token) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
      if (!authError && user) {
        currentUser = user
      }
    }

    // Check if user is admin
    const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                   currentUser?.user_metadata?.role === 'admin' ||
                   currentUser?.email?.includes('admin')

    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    switch (action) {
      case 'get_all': {
        // Generic get all operation with pagination, search, and filters
        const {
          page = 1,
          limit = 50,
          search,
          filters = {},
          sort
        } = params || {}

        let query = supabaseClient.from(table).select("*", { count: "exact" })

        // Apply search
        if (search) {
          // Basic search across common text fields
          const searchFields = ["name", "title", "description", "email"]
          const searchConditions = searchFields
            .map((field) => `${field}.ilike.%${search}%`)
            .join(",")
          query = query.or(searchConditions)
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "boolean") {
              query = query.eq(key, value)
            } else if (typeof value === "string") {
              query = query.ilike(key, `%${value}%`)
            } else {
              query = query.eq(key, value)
            }
          }
        })

        // Apply sorting
        if (sort) {
          query = query.order(sort.field, {
            ascending: sort.direction === "asc",
          })
        } else {
          query = query.order("created_at", { ascending: false })
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data: result, error, count } = await query

        if (error) throw error

        const totalPages = Math.ceil((count || 0) / limit)

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              data: result,
              total: count || 0,
              page,
              limit,
              totalPages,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_by_id': {
        // Get single record by ID
        if (!id) {
          throw new Error('ID is required')
        }

        const { data: result, error } = await supabaseClient
          .from(table)
          .select("*")
          .eq("id", id)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create': {
        // Create new record
        if (!data) {
          throw new Error('Data is required for creation')
        }

        const { data: result, error } = await supabaseClient
          .from(table)
          .insert(data)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        // Update existing record
        if (!id) {
          throw new Error('ID is required for update')
        }
        if (!data) {
          throw new Error('Data is required for update')
        }

        const { data: result, error } = await supabaseClient
          .from(table)
          .update(data)
          .eq("id", id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        // Delete record
        if (!id) {
          throw new Error('ID is required for deletion')
        }

        const { error } = await supabaseClient.from(table).delete().eq("id", id)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_admin_stats': {
        // Get comprehensive admin dashboard statistics
        const tables = [
          "appointments",
          "consultation_requests",
          "contact_submissions",
          "procedures",
          "providers",
          "blog_posts",
          "gallery_items",
          "video_shorts",
          "youtube_videos",
          "selfie_reviews",
          "event_banners",
        ]

        const statsPromises = tables.map(async (tableName) => {
          const { count } = await supabaseClient
            .from(tableName)
            .select("*", { count: "exact", head: true })
          return { table: tableName, count: count || 0 }
        })

        const results = await Promise.all(statsPromises)
        const stats = results.reduce((acc, { table: tableName, count }) => {
          acc[tableName] = count
          return acc
        }, {} as Record<string, number>)

        // Get today's appointments
        const today = new Date().toISOString().split("T")[0]
        const { count: todayAppointments } = await supabaseClient
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .gte("preferred_date", today)
          .lt("preferred_date", `${today}T23:59:59`)

        // Get pending appointments
        const { count: pendingAppointments } = await supabaseClient
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        // Get new consultations (last 24 hours)
        const yesterday = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString()
        const { count: newConsultations } = await supabaseClient
          .from("consultation_requests")
          .select("*", { count: "exact", head: true })
          .gte("created_at", yesterday)

        // Get new contact submissions (last 24 hours)
        const { count: newContactSubmissions } = await supabaseClient
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .gte("created_at", yesterday)

        const adminStats = {
          totalAppointments: stats.appointments || 0,
          pendingAppointments: pendingAppointments || 0,
          todayAppointments: todayAppointments || 0,
          totalConsultations: stats.consultation_requests || 0,
          newConsultations: newConsultations || 0,
          totalContactSubmissions: stats.contact_submissions || 0,
          newContactSubmissions: newContactSubmissions || 0,
          totalProcedures: stats.procedures || 0,
          totalProviders: stats.providers || 0,
          totalBlogPosts: stats.blog_posts || 0,
          totalGalleryItems: stats.gallery_items || 0,
          totalVideoShorts: stats.video_shorts || 0,
          totalYouTubeVideos: stats.youtube_videos || 0,
          totalSelfieReviews: stats.selfie_reviews || 0,
          totalEventBanners: stats.event_banners || 0,
        }

        return new Response(
          JSON.stringify({ success: true, data: adminStats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'bulk_delete': {
        // Bulk delete operation
        const { ids } = params || {}
        if (!ids || !Array.isArray(ids)) {
          throw new Error('IDs array is required for bulk delete')
        }

        const { error } = await supabaseClient.from(table).delete().in("id", ids)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'bulk_update': {
        // Bulk update operation
        const { updates } = params || {}
        if (!updates || !Array.isArray(updates)) {
          throw new Error('Updates array is required for bulk update')
        }

        const promises = updates.map(({ id: updateId, data: updateData }) =>
          supabaseClient.from(table).update(updateData).eq("id", updateId)
        )

        await Promise.all(promises)

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error in admin-operations function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: error.message?.includes('Unauthorized') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
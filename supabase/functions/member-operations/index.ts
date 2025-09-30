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
    const { action, userId, profileData, options } = await req.json()

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

    switch (action) {
      case 'get_member_appointments': {
        // Get appointments for a specific member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is requesting their own appointments or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to appointments')
        }

        // Get the user's email from auth.users
        const { data: authUser, error: authUserError } = await supabaseClient.auth.admin.getUserById(userId)

        if (authUserError) throw authUserError
        if (!authUser || !authUser.user) throw new Error('User not found')

        const userEmail = authUser.user.email

        // Build query for appointments
        let query = supabaseClient
          .from('appointments')
          .select('*')
          .eq('patient_email', userEmail)

        // Apply filters based on options
        if (options?.upcoming) {
          query = query.gte('appointment_date', new Date().toISOString())
          query = query.order('appointment_date', { ascending: true })
        } else {
          query = query.order('appointment_date', { ascending: false })
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_medical_records': {
        // Get medical records for a member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check authorization
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to medical records')
        }

        let query = supabaseClient
          .from('medical_records')
          .select('*')
          .eq('patient_id', userId)
          .order('visit_date', { ascending: false })

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_prescriptions': {
        // Get prescriptions for a member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check authorization
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to prescriptions')
        }

        let query = supabaseClient
          .from('prescriptions')
          .select('*')
          .eq('patient_id', userId)
          .order('prescribed_date', { ascending: false })

        if (options?.status) {
          query = query.eq('status', options.status)
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_payment_history': {
        // Get payment history for a member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check authorization
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to payment history')
        }

        let query = supabaseClient
          .from('payment_history')
          .select('*')
          .eq('patient_id', userId)
          .order('payment_date', { ascending: false })

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_consultation_notes': {
        // Get consultation notes for a member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check authorization
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to consultation notes')
        }

        let query = supabaseClient
          .from('consultation_notes')
          .select('*')
          .eq('patient_id', userId)
          .order('consultation_date', { ascending: false })

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
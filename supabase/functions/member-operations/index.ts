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
      case 'create_profile': {
        // Create member profile
        const { data, error } = await supabaseClient
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_profile': {
        // Get member profile by ID
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is requesting their own profile or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to profile')
        }

        const { data, error } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_profile': {
        // Update member profile
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is updating their own profile or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to profile')
        }

        const { data, error } = await supabaseClient
          .from('user_profiles')
          .update(profileData)
          .eq('id', userId)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

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

        // First get the user's email
        const { data: profile, error: profileError } = await supabaseClient
          .from('user_profiles')
          .select('email')
          .eq('id', userId)
          .single()

        if (profileError) throw profileError

        let query = supabaseClient
          .from('appointments')
          .select('*')
          .eq('patient_email', profile.email)

        if (options?.upcoming) {
          query = query.gte('preferred_date', new Date().toISOString().split('T')[0])
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        query = query.order('preferred_date', { ascending: true })

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_medical_records': {
        // Get medical records for a specific member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is requesting their own records or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to medical records')
        }

        let query = supabaseClient
          .from('medical_records')
          .select(`
            *,
            provider:providers(*)
          `)
          .eq('member_id', userId)

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        query = query.order('visit_date', { ascending: false })

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_prescriptions': {
        // Get prescriptions for a specific member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is requesting their own prescriptions or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to prescriptions')
        }

        let query = supabaseClient
          .from('prescriptions')
          .select(`
            *,
            provider:providers(*)
          `)
          .eq('member_id', userId)

        if (options?.status) {
          query = query.eq('status', options.status)
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        query = query.order('prescribed_date', { ascending: false })

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_payment_history': {
        // Get payment history for a specific member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is requesting their own payment history or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to payment history')
        }

        let query = supabaseClient
          .from('payment_history')
          .select('*')
          .eq('member_id', userId)

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        query = query.order('payment_date', { ascending: false })

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_consultation_notes': {
        // Get consultation notes for a specific member
        if (!userId) {
          throw new Error('User ID is required')
        }

        // Check if user is requesting their own consultation notes or is admin
        const isAdmin = currentUser?.email === 'admin@onecellclinic.com' ||
                       currentUser?.user_metadata?.role === 'admin'
        const isOwnProfile = currentUser?.id === userId

        if (!isAdmin && !isOwnProfile) {
          throw new Error('Unauthorized access to consultation notes')
        }

        let query = supabaseClient
          .from('consultation_notes')
          .select(`
            *,
            provider:providers(*)
          `)
          .eq('member_id', userId)

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        query = query.order('consultation_date', { ascending: false })

        const { data, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error in member-operations function:', error)
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
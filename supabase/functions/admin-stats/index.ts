import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AdminStats {
  totalAppointments: number
  pendingAppointments: number
  todayAppointments: number
  totalConsultations: number
  newConsultations: number
  totalProcedures: number
  activeProcedures: number
  totalProviders: number
  activeProviders: number
  totalGalleryItems: number
  recentActivity: ActivityLog[]
}

interface ActivityLog {
  id: string
  type: 'appointment' | 'consultation' | 'content' | 'user'
  action: string
  description: string
  user_id?: string
  user_name?: string
  timestamp: string
  metadata?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated and has admin role
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get today's date for filtering
    const today = new Date().toISOString().split('T')[0]

    // Parallel queries for better performance
    const [
      appointmentsResult,
      pendingAppointmentsResult,
      todayAppointmentsResult,
      consultationsResult,
      newConsultationsResult,
      proceduresResult,
      activeProceduresResult,
      providersResult,
      activeProvidersResult,
      galleryResult
    ] = await Promise.all([
      // Total appointments
      supabaseClient
        .from('appointments')
        .select('id', { count: 'exact', head: true }),

      // Pending appointments
      supabaseClient
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Today's appointments
      supabaseClient
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('preferred_date', today),

      // Total consultations
      supabaseClient
        .from('consultation_requests')
        .select('id', { count: 'exact', head: true }),

      // New consultations
      supabaseClient
        .from('consultation_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),

      // Total procedures
      supabaseClient
        .from('procedures')
        .select('id', { count: 'exact', head: true }),

      // Active procedures
      supabaseClient
        .from('procedures')
        .select('id', { count: 'exact', head: true })
        .eq('active', true),

      // Total providers
      supabaseClient
        .from('providers')
        .select('id', { count: 'exact', head: true }),

      // Active providers
      supabaseClient
        .from('providers')
        .select('id', { count: 'exact', head: true })
        .eq('active', true),

      // Gallery items
      supabaseClient
        .from('gallery_items')
        .select('id', { count: 'exact', head: true })
    ])

    // Get recent activity (appointments and consultations created in last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentAppointments = await supabaseClient
      .from('appointments')
      .select('id, patient_name, service_type, status, created_at')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    const recentConsultations = await supabaseClient
      .from('consultation_requests')
      .select('id, patient_name, consultation_type, status, created_at')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    // Generate activity logs
    const recentActivity: ActivityLog[] = []

    // Add appointment activities
    if (recentAppointments.data) {
      recentAppointments.data.forEach(appointment => {
        recentActivity.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          action: 'created',
          description: `${appointment.patient_name}님이 ${appointment.service_type} 예약을 신청했습니다`,
          user_name: appointment.patient_name,
          timestamp: appointment.created_at,
          metadata: {
            appointment_id: appointment.id,
            service_type: appointment.service_type,
            status: appointment.status
          }
        })
      })
    }

    // Add consultation activities
    if (recentConsultations.data) {
      recentConsultations.data.forEach(consultation => {
        recentActivity.push({
          id: `consultation-${consultation.id}`,
          type: 'consultation',
          action: 'submitted',
          description: `${consultation.patient_name}님이 ${consultation.consultation_type} 상담을 요청했습니다`,
          user_name: consultation.patient_name,
          timestamp: consultation.created_at,
          metadata: {
            consultation_id: consultation.id,
            consultation_type: consultation.consultation_type,
            status: consultation.status
          }
        })
      })
    }

    // Sort activities by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Compile stats
    const stats: AdminStats = {
      totalAppointments: appointmentsResult.count || 0,
      pendingAppointments: pendingAppointmentsResult.count || 0,
      todayAppointments: todayAppointmentsResult.count || 0,
      totalConsultations: consultationsResult.count || 0,
      newConsultations: newConsultationsResult.count || 0,
      totalProcedures: proceduresResult.count || 0,
      activeProcedures: activeProceduresResult.count || 0,
      totalProviders: providersResult.count || 0,
      activeProviders: activeProvidersResult.count || 0,
      totalGalleryItems: galleryResult.count || 0,
      recentActivity: recentActivity.slice(0, 10) // Limit to 10 most recent
    }

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in admin-stats function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
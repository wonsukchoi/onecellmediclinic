import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MemberDashboardRequest {
  action: 'get_dashboard' | 'update_profile' | 'get_medical_records' | 'get_prescriptions' | 'get_payment_history'
  memberId: string
  data?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, memberId, data }: MemberDashboardRequest = await req.json()

    // Verify that the user can access this member data
    if (user.id !== memberId && user.user_metadata?.role !== 'admin') {
      throw new Error('Forbidden: You can only access your own data')
    }

    let result

    switch (action) {
      case 'get_dashboard':
        result = await getDashboardData(supabaseClient, memberId)
        break
      case 'update_profile':
        result = await updateMemberProfile(supabaseClient, memberId, data)
        break
      case 'get_medical_records':
        result = await getMedicalRecords(supabaseClient, memberId, data)
        break
      case 'get_prescriptions':
        result = await getPrescriptions(supabaseClient, memberId, data)
        break
      case 'get_payment_history':
        result = await getPaymentHistory(supabaseClient, memberId, data)
        break
      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in manage-member-data function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function getDashboardData(supabaseClient: any, memberId: string) {
  try {
    // Get member profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', memberId)
      .single()

    if (profileError) throw profileError

    // Get upcoming appointments
    const { data: memberProfile } = await supabaseClient
      .from('user_profiles')
      .select('email')
      .eq('id', memberId)
      .single()

    const { data: upcomingAppointments } = await supabaseClient
      .from('appointments')
      .select('*')
      .eq('patient_email', memberProfile?.email)
      .gte('preferred_date', new Date().toISOString().split('T')[0])
      .order('preferred_date', { ascending: true })
      .limit(5)

    // Get recent medical records
    const { data: recentMedicalRecords } = await supabaseClient
      .from('medical_records')
      .select(`
        *,
        provider:providers(*)
      `)
      .eq('member_id', memberId)
      .order('visit_date', { ascending: false })
      .limit(5)

    // Get active prescriptions
    const { data: activePrescriptions } = await supabaseClient
      .from('prescriptions')
      .select(`
        *,
        provider:providers(*)
      `)
      .eq('member_id', memberId)
      .eq('status', 'active')
      .order('prescribed_date', { ascending: false })
      .limit(5)

    // Get recent payments
    const { data: recentPayments } = await supabaseClient
      .from('payment_history')
      .select('*')
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false })
      .limit(5)

    // Get unread notifications
    const { count: unreadNotifications } = await supabaseClient
      .from('member_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .is('read_at', null)

    // Prepare membership status
    const membershipType = profile.membership_type || 'basic'
    const membershipBenefits = getMembershipBenefits(membershipType)

    const dashboardData = {
      profile,
      upcomingAppointments: upcomingAppointments || [],
      recentMedicalRecords: recentMedicalRecords || [],
      activePrescriptions: activePrescriptions || [],
      recentPayments: recentPayments || [],
      unreadNotifications: unreadNotifications || 0,
      membershipStatus: {
        type: membershipType,
        benefits: membershipBenefits,
        expiryDate: null // Could be implemented for premium/VIP memberships
      }
    }

    return dashboardData

  } catch (error) {
    console.error('Error getting dashboard data:', error)
    throw error
  }
}

async function updateMemberProfile(supabaseClient: any, memberId: string, updateData: any) {
  try {
    const { data, error } = await supabaseClient
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error

    return data

  } catch (error) {
    console.error('Error updating member profile:', error)
    throw error
  }
}

async function getMedicalRecords(supabaseClient: any, memberId: string, options: any = {}) {
  try {
    const { limit = 10, offset = 0 } = options

    const { data, error } = await supabaseClient
      .from('medical_records')
      .select(`
        *,
        provider:providers(*)
      `)
      .eq('member_id', memberId)
      .order('visit_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error getting medical records:', error)
    throw error
  }
}

async function getPrescriptions(supabaseClient: any, memberId: string, options: any = {}) {
  try {
    const { status, limit = 10, offset = 0 } = options

    let query = supabaseClient
      .from('prescriptions')
      .select(`
        *,
        provider:providers(*)
      `)
      .eq('member_id', memberId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('prescribed_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error getting prescriptions:', error)
    throw error
  }
}

async function getPaymentHistory(supabaseClient: any, memberId: string, options: any = {}) {
  try {
    const { limit = 10, offset = 0 } = options

    const { data, error } = await supabaseClient
      .from('payment_history')
      .select('*')
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error getting payment history:', error)
    throw error
  }
}

function getMembershipBenefits(type: string): string[] {
  const benefits = {
    basic: [
      '기본 진료 예약',
      '온라인 상담',
      '진료 기록 조회',
      '처방전 조회'
    ],
    premium: [
      '우선 예약',
      '전용 상담 라인',
      '정기 건강 검진 할인',
      'VIP 대기실 이용',
      '전담 코디네이터 배정'
    ],
    vip: [
      '당일 예약 가능',
      '24시간 응급 상담',
      '모든 시술 최대 할인',
      '개인 맞춤 케어 프로그램',
      '프리미엄 시설 이용',
      '전용 주차 공간'
    ]
  }

  return benefits[type as keyof typeof benefits] || benefits.basic
}

/* To deploy this function, run:
 * supabase functions deploy manage-member-data
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  action: 'get_notifications' | 'mark_read' | 'mark_all_read' | 'send_notification'
  memberId?: string
  notificationId?: string
  notificationData?: {
    title: string
    message: string
    type?: string
    actionUrl?: string
    metadata?: any
  }
  options?: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
  }
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

    const { action, memberId, notificationId, notificationData, options }: NotificationRequest = await req.json()

    let result

    switch (action) {
      case 'get_notifications':
        if (!memberId) throw new Error('Member ID is required')
        // Verify user can access these notifications
        if (user.id !== memberId && user.user_metadata?.role !== 'admin') {
          throw new Error('Forbidden: You can only access your own notifications')
        }
        result = await getNotifications(supabaseClient, memberId, options)
        break

      case 'mark_read':
        if (!notificationId || !memberId) throw new Error('Notification ID and Member ID are required')
        // Verify user can modify this notification
        if (user.id !== memberId && user.user_metadata?.role !== 'admin') {
          throw new Error('Forbidden: You can only modify your own notifications')
        }
        result = await markNotificationRead(supabaseClient, notificationId, memberId)
        break

      case 'mark_all_read':
        if (!memberId) throw new Error('Member ID is required')
        // Verify user can modify these notifications
        if (user.id !== memberId && user.user_metadata?.role !== 'admin') {
          throw new Error('Forbidden: You can only modify your own notifications')
        }
        result = await markAllNotificationsRead(supabaseClient, memberId)
        break

      case 'send_notification':
        // Only admins or staff can send notifications
        if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'staff') {
          throw new Error('Forbidden: Only staff can send notifications')
        }
        if (!memberId || !notificationData) throw new Error('Member ID and notification data are required')
        result = await sendNotification(supabaseClient, memberId, notificationData)
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
    console.error('Error in manage-member-notifications function:', error)
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

async function getNotifications(supabaseClient: any, memberId: string, options: any = {}) {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = options

    let query = supabaseClient
      .from('member_notifications')
      .select('*')
      .eq('member_id', memberId)

    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Also get the count of unread notifications
    const { count: unreadCount } = await supabaseClient
      .from('member_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .is('read_at', null)

    return {
      notifications: data || [],
      unreadCount: unreadCount || 0
    }

  } catch (error) {
    console.error('Error getting notifications:', error)
    throw error
  }
}

async function markNotificationRead(supabaseClient: any, notificationId: string, memberId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('member_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('member_id', memberId)
      .is('read_at', null)
      .select()
      .single()

    if (error) throw error

    return { success: !!data }

  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

async function markAllNotificationsRead(supabaseClient: any, memberId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('member_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('member_id', memberId)
      .is('read_at', null)

    if (error) throw error

    return { success: true, count: data?.length || 0 }

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

async function sendNotification(supabaseClient: any, memberId: string, notificationData: any) {
  try {
    const {
      title,
      message,
      type = 'info',
      actionUrl,
      metadata = {}
    } = notificationData

    const { data, error } = await supabaseClient
      .from('member_notifications')
      .insert({
        member_id: memberId,
        title,
        message,
        type,
        action_url: actionUrl,
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Here you could also send email/SMS notifications
    // await sendEmailNotification(memberId, title, message)
    // await sendSMSNotification(memberId, message)

    return data

  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

// Helper function to send automated notifications
async function sendAutomatedNotifications(supabaseClient: any) {
  try {
    // Example: Send appointment reminders
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDateString = tomorrow.toISOString().split('T')[0]

    // Get appointments for tomorrow
    const { data: tomorrowAppointments } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        patient_name,
        patient_email,
        preferred_date,
        preferred_time,
        service_type
      `)
      .eq('preferred_date', tomorrowDateString)
      .eq('status', 'confirmed')

    // Send reminder notifications
    if (tomorrowAppointments) {
      for (const appointment of tomorrowAppointments) {
        // Get member profile by email
        const { data: memberProfile } = await supabaseClient
          .from('member_profiles')
          .select('id')
          .eq('email', appointment.patient_email)
          .single()

        if (memberProfile) {
          await sendNotification(supabaseClient, memberProfile.id, {
            title: '내일 예약 알림',
            message: `${appointment.preferred_date} ${appointment.preferred_time}에 ${appointment.service_type} 예약이 있습니다.`,
            type: 'appointment',
            actionUrl: '/member/appointments',
            metadata: {
              appointmentId: appointment.id,
              reminderType: 'day_before'
            }
          })
        }
      }
    }

    // Example: Send prescription expiry reminders
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    const { data: expiringPrescriptions } = await supabaseClient
      .from('prescriptions')
      .select(`
        id,
        member_id,
        medication_name,
        expiry_date
      `)
      .eq('status', 'active')
      .lte('expiry_date', weekFromNow.toISOString().split('T')[0])

    if (expiringPrescriptions) {
      for (const prescription of expiringPrescriptions) {
        await sendNotification(supabaseClient, prescription.member_id, {
          title: '처방전 만료 알림',
          message: `${prescription.medication_name} 처방전이 곧 만료됩니다. 새로운 처방전이 필요하시면 예약해주세요.`,
          type: 'reminder',
          actionUrl: '/member/prescriptions',
          metadata: {
            prescriptionId: prescription.id,
            reminderType: 'expiry_warning'
          }
        })
      }
    }

  } catch (error) {
    console.error('Error sending automated notifications:', error)
  }
}

/* To deploy this function, run:
 * supabase functions deploy manage-member-notifications
 */
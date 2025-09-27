import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface NotificationRequest {
  type: 'appointment_status' | 'consultation_response' | 'reminder'
  recipient_email: string
  data: {
    patient_name?: string
    appointment_id?: number
    consultation_id?: number
    status?: string
    message?: string
    appointment_date?: string
    appointment_time?: string
    service_type?: string
  }
}

const EMAIL_TEMPLATES = {
  appointment_status: {
    confirmed: {
      subject: '[원셀의원] 예약이 확정되었습니다',
      template: `
        안녕하세요 {{patient_name}}님,

        원셀의원입니다.
        요청하신 예약이 확정되었습니다.

        ■ 예약 정보
        - 시술/서비스: {{service_type}}
        - 예약일시: {{appointment_date}} {{appointment_time}}
        - 예약번호: {{appointment_id}}

        예약 시간 10분 전까지 내원해 주시기 바랍니다.
        변경이나 취소가 필요한 경우 최소 24시간 전에 연락 주세요.

        감사합니다.

        원셀의원
        전화: 02-1234-5678
        주소: 서울특별시 강남구 역삼동 123-45
      `
    },
    cancelled: {
      subject: '[원셀의원] 예약이 취소되었습니다',
      template: `
        안녕하세요 {{patient_name}}님,

        원셀의원입니다.
        요청하신 예약이 취소되었습니다.

        ■ 취소된 예약 정보
        - 시술/서비스: {{service_type}}
        - 예약일시: {{appointment_date}} {{appointment_time}}
        - 예약번호: {{appointment_id}}

        {{#if message}}
        취소 사유: {{message}}
        {{/if}}

        다시 예약을 원하시면 언제든 연락 주세요.

        감사합니다.

        원셀의원
        전화: 02-1234-5678
      `
    }
  },
  consultation_response: {
    subject: '[원셀의원] 상담 답변이 도착했습니다',
    template: `
      안녕하세요 {{patient_name}}님,

      원셀의원입니다.
      요청하신 상담에 대한 답변을 드립니다.

      ■ 상담 답변
      {{message}}

      추가 문의사항이 있으시면 언제든 연락 주세요.
      직접 상담을 원하시면 예약을 진행해 주시기 바랍니다.

      감사합니다.

      원셀의원
      전화: 02-1234-5678
      온라인 예약: https://onecellclinic.com/reservation
    `
  },
  reminder: {
    subject: '[원셀의원] 예약 안내 (내일 예약)',
    template: `
      안녕하세요 {{patient_name}}님,

      원셀의원입니다.
      내일 예약 안내드립니다.

      ■ 예약 정보
      - 시술/서비스: {{service_type}}
      - 예약일시: {{appointment_date}} {{appointment_time}}
      - 예약번호: {{appointment_id}}

      ■ 안내사항
      - 예약 시간 10분 전까지 내원해 주세요
      - 신분증을 지참해 주세요
      - 편안한 복장으로 내원해 주세요

      변경이나 취소가 필요한 경우 즉시 연락 주세요.

      감사합니다.

      원셀의원
      전화: 02-1234-5678
    `
  }
}

function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template

  // Simple template rendering (replace {{variable}} with data)
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    rendered = rendered.replace(regex, data[key] || '')
  })

  // Handle conditional blocks {{#if variable}}...{{/if}}
  rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
    return data[variable] ? content : ''
  })

  return rendered.trim()
}

async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  try {
    // In a real implementation, you would use a service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Mailgun

    // For now, we'll just log the email (in production, implement actual email sending)
    console.log('=== EMAIL NOTIFICATION ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Content:', htmlContent)
    console.log('========================')

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
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

    // Verify user is authenticated
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

    // Parse request body
    const notificationRequest: NotificationRequest = await req.json()

    let subject: string
    let template: string

    // Determine email template based on notification type
    switch (notificationRequest.type) {
      case 'appointment_status':
        const status = notificationRequest.data.status || 'confirmed'
        const statusTemplate = EMAIL_TEMPLATES.appointment_status[status as keyof typeof EMAIL_TEMPLATES.appointment_status]
        if (!statusTemplate) {
          throw new Error(`Unknown appointment status: ${status}`)
        }
        subject = statusTemplate.subject
        template = statusTemplate.template
        break

      case 'consultation_response':
        subject = EMAIL_TEMPLATES.consultation_response.subject
        template = EMAIL_TEMPLATES.consultation_response.template
        break

      case 'reminder':
        subject = EMAIL_TEMPLATES.reminder.subject
        template = EMAIL_TEMPLATES.reminder.template
        break

      default:
        throw new Error(`Unknown notification type: ${notificationRequest.type}`)
    }

    // Render template with data
    const renderedSubject = renderTemplate(subject, notificationRequest.data)
    const renderedContent = renderTemplate(template, notificationRequest.data)

    // Convert plain text to HTML (basic formatting)
    const htmlContent = renderedContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/■/g, '<strong>■</strong>')

    // Send email
    const emailSent = await sendEmail(
      notificationRequest.recipient_email,
      renderedSubject,
      `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${htmlContent}
        </body>
      </html>
      `
    )

    if (!emailSent) {
      throw new Error('Failed to send email')
    }

    // Log notification in database (optional)
    try {
      await supabaseClient
        .from('notification_logs')
        .insert([
          {
            type: notificationRequest.type,
            recipient_email: notificationRequest.recipient_email,
            subject: renderedSubject,
            content: renderedContent,
            sent_at: new Date().toISOString(),
            status: 'sent'
          }
        ])
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Error logging notification:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return handleDatabaseError(error, 'notifications', 'admin-notifications')
  }
})
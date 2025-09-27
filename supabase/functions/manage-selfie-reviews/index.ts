import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleDatabaseError } from '../_shared/error-handler.ts'

interface SelfieReview {
  id?: number
  patient_name: string
  patient_initial?: string
  procedure_type?: string
  procedure_id?: number
  selfie_url: string
  review_text?: string
  rating?: number
  verified?: boolean
  featured?: boolean
  patient_age_range?: string
  treatment_date?: string
  recovery_weeks?: number
  consent_given?: boolean
  display_order?: number
  tags?: string[]
  moderation_status?: string
  moderation_notes?: string
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
            .from('selfie_reviews')
            .select(`
              *,
              procedures:procedure_id (
                id,
                name,
                slug
              )
            `)
            .eq('id', id)
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const procedure_type = url.searchParams.get('procedure_type')
          const verified = url.searchParams.get('verified')
          const featured = url.searchParams.get('featured')
          const moderation_status = url.searchParams.get('moderation_status') ?? 'approved'
          const consent_given = url.searchParams.get('consent_given') ?? 'true'

          let query = supabase
            .from('selfie_reviews')
            .select(`
              *,
              procedures:procedure_id (
                id,
                name,
                slug
              )
            `)
            .eq('consent_given', consent_given === 'true')
            .eq('moderation_status', moderation_status)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })

          if (procedure_type && procedure_type !== 'all') {
            query = query.eq('procedure_type', procedure_type)
          }

          if (verified === 'true') {
            query = query.eq('verified', true)
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
        const body = await req.json() as SelfieReview

        // Set default values
        if (!body.moderation_status) body.moderation_status = 'pending'
        if (!body.verified) body.verified = false
        if (!body.featured) body.featured = false
        if (!body.consent_given) body.consent_given = false
        if (!body.display_order) body.display_order = 0

        // Generate patient initial if not provided
        if (!body.patient_initial && body.patient_name) {
          const names = body.patient_name.split(' ')
          body.patient_initial = names[0][0] + '**'
        }

        const { data, error } = await supabase
          .from('selfie_reviews')
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

        const body = await req.json() as Partial<SelfieReview>

        const { data, error } = await supabase
          .from('selfie_reviews')
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
          .from('selfie_reviews')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'PATCH': {
        const action = url.searchParams.get('action')

        if (action === 'moderate' && id) {
          const { status, notes } = await req.json() as { status: string; notes?: string }

          const updateData: any = { moderation_status: status }
          if (notes) updateData.moderation_notes = notes

          // Auto-verify if approved
          if (status === 'approved') {
            updateData.verified = true
          }

          const { data, error } = await supabase
            .from('selfie_reviews')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'feature' && id) {
          const { featured } = await req.json() as { featured: boolean }

          const { data, error } = await supabase
            .from('selfie_reviews')
            .update({ featured })
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'reorder') {
          const { items } = await req.json() as { items: Array<{ id: number; display_order: number }> }

          const updates = items.map(item =>
            supabase
              .from('selfie_reviews')
              .update({ display_order: item.display_order })
              .eq('id', item.id)
          )

          await Promise.all(updates)

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (action === 'statistics') {
          // Get review statistics
          const { data: stats, error: statsError } = await supabase
            .from('selfie_reviews')
            .select('rating, moderation_status, verified, procedure_type')

          if (statsError) throw statsError

          const statistics = {
            total_reviews: stats.length,
            verified_reviews: stats.filter(r => r.verified).length,
            pending_moderation: stats.filter(r => r.moderation_status === 'pending').length,
            approved_reviews: stats.filter(r => r.moderation_status === 'approved').length,
            rejected_reviews: stats.filter(r => r.moderation_status === 'rejected').length,
            average_rating: stats.filter(r => r.rating).reduce((acc, r) => acc + r.rating, 0) / stats.filter(r => r.rating).length || 0,
            procedure_breakdown: stats.reduce((acc, r) => {
              if (r.procedure_type) {
                acc[r.procedure_type] = (acc[r.procedure_type] || 0) + 1
              }
              return acc
            }, {} as Record<string, number>)
          }

          return new Response(JSON.stringify(statistics), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
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
    return handleDatabaseError(error, 'selfie_reviews', 'manage-selfie-reviews')
  }
})
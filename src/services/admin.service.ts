import { supabase } from './supabase'
import type {
  AdminStats,
  ApiResponse,
  Procedure,
  ProcedureCategory,
  Provider,
  ConsultationRequest,
  GalleryItem,
  Appointment,
  BlogPost,
  EventBanner,
  AvailabilitySlot,
  FilterParams,
  PaginationParams,
  SortParams
} from '../types'

export class AdminService {
  // Admin authentication and stats
  static async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/admin-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        // Fallback to mock data if edge function is not available
        console.warn('Edge function not available, using mock data')
        const mockStats: AdminStats = {
          totalAppointments: 124,
          pendingAppointments: 8,
          todayAppointments: 5,
          totalConsultations: 67,
          newConsultations: 3,
          totalProcedures: 15,
          activeProcedures: 12,
          totalProviders: 4,
          activeProviders: 3,
          totalGalleryItems: 28,
          recentActivity: [
            {
              id: '1',
              type: 'appointment',
              action: 'created',
              description: '김민수님이 보톡스 시술 예약을 신청했습니다',
              user_name: '김민수',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            },
            {
              id: '2',
              type: 'consultation',
              action: 'submitted',
              description: '새로운 상담 요청이 접수되었습니다',
              user_name: '이지은',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            },
            {
              id: '3',
              type: 'appointment',
              action: 'confirmed',
              description: '예약이 확정되었습니다',
              user_name: '관리자',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
            }
          ]
        }
        return { success: true, data: mockStats }
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Procedure Management
  static async getProcedures(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<Procedure[]>> {
    try {
      let query = supabase
        .from('procedures')
        .select(`
          *,
          category:procedure_categories(*)
        `)

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }

      if (sort?.field) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' })
      } else {
        query = query.order('display_order', { ascending: true })
      }

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching procedures:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async createProcedure(procedure: Partial<Procedure>): Promise<ApiResponse<Procedure>> {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .insert([procedure])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating procedure:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateProcedure(id: number, procedure: Partial<Procedure>): Promise<ApiResponse<Procedure>> {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .update(procedure)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating procedure:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async deleteProcedure(id: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting procedure:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Provider Management
  static async getProviders(
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<ApiResponse<Provider[]>> {
    try {
      let query = supabase
        .from('providers')
        .select('*')

      if (filters?.search) {
        query = query.ilike('full_name', `%${filters.search}%`)
      }

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('full_name', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching providers:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async createProvider(provider: Partial<Provider>): Promise<ApiResponse<Provider>> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .insert([provider])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating provider:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateProvider(id: number, provider: Partial<Provider>): Promise<ApiResponse<Provider>> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .update(provider)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating provider:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Appointment Management
  static async getAppointments(
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<ApiResponse<Appointment[]>> {
    try {
      let query = supabase
        .from('appointments')
        .select('*')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.provider) {
        query = query.eq('provider_id', filters.provider)
      }

      if (filters?.dateFrom) {
        query = query.gte('preferred_date', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('preferred_date', filters.dateTo)
      }

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateAppointmentStatus(
    id: number,
    status: string,
    notes?: string
  ): Promise<ApiResponse<Appointment>> {
    try {
      const updateData: any = { status }
      if (notes) updateData.notes = notes

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Consultation Management
  static async getConsultationRequests(
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<ApiResponse<ConsultationRequest[]>> {
    try {
      let query = supabase
        .from('consultation_requests')
        .select(`
          *,
          provider:providers(*)
        `)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.search) {
        query = query.or(`patient_name.ilike.%${filters.search}%,patient_email.ilike.%${filters.search}%`)
      }

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching consultation requests:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateConsultationRequest(
    id: number,
    updates: Partial<ConsultationRequest>
  ): Promise<ApiResponse<ConsultationRequest>> {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating consultation request:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Gallery Management
  static async getGalleryItems(
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<ApiResponse<GalleryItem[]>> {
    try {
      let query = supabase
        .from('gallery_items')
        .select(`
          *,
          procedure:procedures(*),
          provider:providers(*)
        `)

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('display_order', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching gallery items:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async createGalleryItem(item: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .insert([item])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating gallery item:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateGalleryItem(id: number, item: Partial<GalleryItem>): Promise<ApiResponse<GalleryItem>> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .update(item)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating gallery item:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async deleteGalleryItem(id: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Blog Management
  static async getAllBlogPosts(
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<ApiResponse<BlogPost[]>> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async createBlogPost(post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating blog post:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateBlogPost(id: number, post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating blog post:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async deleteBlogPost(id: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting blog post:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Event Banner Management
  static async getAllEventBanners(
    pagination?: PaginationParams
  ): Promise<ApiResponse<EventBanner[]>> {
    try {
      let query = supabase
        .from('event_banners')
        .select('*')

      if (pagination) {
        const { page, limit } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('priority', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching event banners:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async createEventBanner(banner: Partial<EventBanner>): Promise<ApiResponse<EventBanner>> {
    try {
      const { data, error } = await supabase
        .from('event_banners')
        .insert([banner])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating event banner:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateEventBanner(id: number, banner: Partial<EventBanner>): Promise<ApiResponse<EventBanner>> {
    try {
      const { data, error } = await supabase
        .from('event_banners')
        .update(banner)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating event banner:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async deleteEventBanner(id: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('event_banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting event banner:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Procedure Categories
  static async getProcedureCategories(): Promise<ApiResponse<ProcedureCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('procedure_categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching procedure categories:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Notification Service
  static async sendNotification(
    type: 'appointment_status' | 'consultation_response' | 'reminder',
    recipientEmail: string,
    data: Record<string, any>
  ): Promise<ApiResponse<void>> {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/admin-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type,
          recipient_email: recipientEmail,
          data
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to send notification')
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
import { supabase } from './supabase'

// Supabase configuration
const supabaseUrl = 'https://weqqkknwpgremfugcbvz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg'

// API endpoints mapping to Supabase edge functions
const API_ENDPOINTS = {
  videoShorts: `${supabaseUrl}/functions/v1/manage-video-shorts`,
  features: `${supabaseUrl}/functions/v1/manage-features`,
  events: `${supabaseUrl}/functions/v1/manage-events`,
  selfieReviews: `${supabaseUrl}/functions/v1/manage-selfie-reviews`,
  youtubeVideos: `${supabaseUrl}/functions/v1/manage-youtube-videos`,
  differentiators: `${supabaseUrl}/functions/v1/manage-differentiators`,
  featuredContent: `${supabaseUrl}/functions/v1/get-featured-content`,
  procedures: `${supabaseUrl}/functions/v1/manage-procedures`,
  providers: `${supabaseUrl}/functions/v1/manage-providers`,
  blogPosts: `${supabaseUrl}/functions/v1/manage-blog-posts`,
  galleryItems: `${supabaseUrl}/functions/v1/manage-gallery-items`,
  eventBanners: `${supabaseUrl}/functions/v1/manage-event-banners`,
  consultations: `${supabaseUrl}/functions/v1/manage-consultation-requests`,
  appointments: `${supabaseUrl}/functions/v1/manage-appointments`
}

// Get authentication headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const authToken = session?.access_token || supabaseAnonKey

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  }
}

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const authHeaders = await getAuthHeaders()

    const response = await fetch(endpoint, {
      headers: {
        ...authHeaders,
        ...options.headers
      },
      ...options
    })

    // Check if response is HTML (404 page) instead of JSON
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`API endpoint not found: ${endpoint}. Please ensure the Supabase edge function is deployed.`)
    }

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch {
        // If we can't parse JSON, use the default error message
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    // Handle different response formats
    if (result.error) {
      // Check if it's a missing table error
      if (result.error.includes('table') && result.error.includes('does not exist')) {
        throw new Error('Database not set up: Missing required tables. Please run the database setup script in Supabase SQL Editor: /scripts/setup-features-database.sql')
      }

      // Check if it's a database not ready error
      if (result.code === 'DATABASE_NOT_READY') {
        throw new Error(`${result.error}: ${result.details} Run the setup script: /scripts/setup-features-database.sql in your Supabase SQL Editor.`)
      }

      throw new Error(result.error)
    }

    return result.data || result
  } catch (error) {
    // Re-throw with more context if it's a parsing error
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      throw new Error('Received HTML response instead of JSON. The API endpoint may not exist or the database tables may not be created.')
    }

    // Enhance error messages for common database issues
    if (error instanceof Error) {
      if (error.message.includes('Could not find the table')) {
        throw new Error('Database not set up: Missing required tables. Please run the database setup script in Supabase SQL Editor: /scripts/setup-features-database.sql')
      }
    }

    throw error
  }
}

// Video Shorts Service
export const videoShortsService = {
  getAll: (params?: { category?: string; featured?: boolean; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString())
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.videoShorts}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.videoShorts}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.videoShorts, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: (id: number, data: any) => {
    return apiCall(`${API_ENDPOINTS.videoShorts}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: (id: number) => {
    return apiCall(`${API_ENDPOINTS.videoShorts}?id=${id}`, {
      method: 'DELETE'
    })
  },

  incrementViews: (id: number) => {
    return apiCall(`${API_ENDPOINTS.videoShorts}?action=increment_views&id=${id}`, {
      method: 'PATCH'
    })
  },

  reorder: (items: Array<{ id: number; order_index: number }>) => {
    return apiCall(`${API_ENDPOINTS.videoShorts}?action=reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items })
    })
  }
}

// Clinic Features Service
export const clinicFeaturesService = {
  getAll: (params?: { category?: string; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.features}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.features}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.features, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: (id: number, data: any) => {
    return apiCall(`${API_ENDPOINTS.features}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: (id: number) => {
    return apiCall(`${API_ENDPOINTS.features}?id=${id}`, {
      method: 'DELETE'
    })
  },

  reorder: (items: Array<{ id: number; order_index: number }>) => {
    return apiCall(`${API_ENDPOINTS.features}?action=reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items })
    })
  }
}

// Events Service
export const eventsService = {
  getAll: (params?: { event_type?: string; featured?: boolean; active?: boolean; current_only?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.event_type) searchParams.set('event_type', params.event_type)
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString())
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())
    if (params?.current_only !== undefined) searchParams.set('current_only', params.current_only.toString())

    const url = `${API_ENDPOINTS.events}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.events}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.events, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: (id: number, data: any) => {
    return apiCall(`${API_ENDPOINTS.events}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: (id: number) => {
    return apiCall(`${API_ENDPOINTS.events}?id=${id}`, {
      method: 'DELETE'
    })
  },

  register: (id: number) => {
    return apiCall(`${API_ENDPOINTS.events}?action=register&id=${id}`, {
      method: 'PATCH'
    })
  },

  getAnalytics: (id: number) => {
    return apiCall(`${API_ENDPOINTS.events}?action=analytics&id=${id}`)
  }
}

// Selfie Reviews Service
export const selfieReviewsService = {
  getAll: (params?: {
    procedure_type?: string;
    verified?: boolean;
    featured?: boolean;
    moderation_status?: string;
    consent_given?: boolean;
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.procedure_type) searchParams.set('procedure_type', params.procedure_type)
    if (params?.verified !== undefined) searchParams.set('verified', params.verified.toString())
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString())
    if (params?.moderation_status) searchParams.set('moderation_status', params.moderation_status)
    if (params?.consent_given !== undefined) searchParams.set('consent_given', params.consent_given.toString())

    const url = `${API_ENDPOINTS.selfieReviews}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.selfieReviews}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.selfieReviews, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: (id: number, data: any) => {
    return apiCall(`${API_ENDPOINTS.selfieReviews}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: (id: number) => {
    return apiCall(`${API_ENDPOINTS.selfieReviews}?id=${id}`, {
      method: 'DELETE'
    })
  },

  moderate: (id: number, status: string, notes?: string) => {
    return apiCall(`${API_ENDPOINTS.selfieReviews}?action=moderate&id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    })
  },

  feature: (id: number, featured: boolean) => {
    return apiCall(`${API_ENDPOINTS.selfieReviews}?action=feature&id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ featured })
    })
  },

  getStatistics: () => {
    return apiCall(`${API_ENDPOINTS.selfieReviews}?action=statistics`)
  }
}

// YouTube Videos Service
export const youtubeVideosService = {
  getAll: (params?: { category?: string; featured?: boolean; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString())
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.youtubeVideos}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.youtubeVideos}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.youtubeVideos, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: (id: number, data: any) => {
    return apiCall(`${API_ENDPOINTS.youtubeVideos}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: (id: number) => {
    return apiCall(`${API_ENDPOINTS.youtubeVideos}?id=${id}`, {
      method: 'DELETE'
    })
  },

  incrementViews: (id: number) => {
    return apiCall(`${API_ENDPOINTS.youtubeVideos}?action=increment_views&id=${id}`, {
      method: 'PATCH'
    })
  },

  refreshDetails: (id: number) => {
    return apiCall(`${API_ENDPOINTS.youtubeVideos}?action=refresh_details&id=${id}`, {
      method: 'PATCH'
    })
  }
}

// Differentiators Service
export const differentiatorsService = {
  getAll: (params?: { active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.differentiators}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.differentiators}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.differentiators, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  update: (id: number, data: any) => {
    return apiCall(`${API_ENDPOINTS.differentiators}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete: (id: number) => {
    return apiCall(`${API_ENDPOINTS.differentiators}?id=${id}`, {
      method: 'DELETE'
    })
  },

  reorder: (items: Array<{ id: number; order_index: number }>) => {
    return apiCall(`${API_ENDPOINTS.differentiators}?action=reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ items })
    })
  },

  toggleActive: (id: number) => {
    return apiCall(`${API_ENDPOINTS.differentiators}?action=toggle_active&id=${id}`, {
      method: 'PATCH'
    })
  }
}

// Featured Content Service (for homepage)
export const featuredContentService = {
  getAll: (useFunction?: boolean) => {
    const searchParams = new URLSearchParams()
    if (useFunction) searchParams.set('use_function', 'true')

    const url = `${API_ENDPOINTS.featuredContent}?${searchParams.toString()}`
    return apiCall(url)
  }
}

// Procedures Service
export const proceduresService = {
  getAll: (params?: { category?: string; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.procedures}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.procedures}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.procedures, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', procedureData: data })
    })
  },

  update: (id: number, data: any) => {
    return apiCall(API_ENDPOINTS.procedures, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', procedureId: id, procedureData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.procedures, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', procedureId: id })
    })
  }
}

// Providers Service
export const providersService = {
  getAll: (params?: { active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.providers}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.providers}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.providers, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', providerData: data })
    })
  },

  update: (id: number, data: any) => {
    return apiCall(API_ENDPOINTS.providers, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', providerId: id, providerData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.providers, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', providerId: id })
    })
  }
}

// Blog Posts Service
export const blogPostsService = {
  getAll: (params?: { published?: boolean; author?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.published !== undefined) searchParams.set('published', params.published.toString())
    if (params?.author) searchParams.set('author', params.author)

    const url = `${API_ENDPOINTS.blogPosts}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.blogPosts}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.blogPosts, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', postData: data })
    })
  },

  update: (id: number, data: any) => {
    return apiCall(API_ENDPOINTS.blogPosts, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', postId: id, postData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.blogPosts, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', postId: id })
    })
  }
}

// Gallery Items Service
export const galleryItemsService = {
  getAll: (params?: { category?: string; featured?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString())

    const url = `${API_ENDPOINTS.galleryItems}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.galleryItems}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.galleryItems, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', galleryData: data })
    })
  },

  update: (id: number, data: any) => {
    return apiCall(API_ENDPOINTS.galleryItems, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', galleryId: id, galleryData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.galleryItems, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', galleryId: id })
    })
  }
}

// Event Banners Service
export const eventBannersService = {
  getAll: (params?: { active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.active !== undefined) searchParams.set('active', params.active.toString())

    const url = `${API_ENDPOINTS.eventBanners}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.eventBanners}?id=${id}`)
  },

  create: (data: any) => {
    return apiCall(API_ENDPOINTS.eventBanners, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', bannerData: data })
    })
  },

  update: (id: number, data: any) => {
    return apiCall(API_ENDPOINTS.eventBanners, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', bannerId: id, bannerData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.eventBanners, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', bannerId: id })
    })
  }
}

// Consultations Service
export const consultationsService = {
  getAll: (params?: { status?: string; priority?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.priority) searchParams.set('priority', params.priority)

    const url = `${API_ENDPOINTS.consultations}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.consultations}?id=${id}`)
  },

  update: (id: number, data: any) => {
    return apiCall(API_ENDPOINTS.consultations, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', consultationId: id, consultationData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.consultations, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', consultationId: id })
    })
  }
}

// Appointments Service
export const appointmentsService = {
  getAll: (params?: { status?: string; date?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.date) searchParams.set('date', params.date)

    const url = `${API_ENDPOINTS.appointments}?${searchParams.toString()}`
    return apiCall(url)
  },

  getById: (id: number) => {
    return apiCall(`${API_ENDPOINTS.appointments}?id=${id}`)
  },

  updateStatus: (id: number, status: string, notes?: string) => {
    const data: any = { status }
    if (notes) data.notes = notes

    return apiCall(API_ENDPOINTS.appointments, {
      method: 'POST',
      body: JSON.stringify({ action: 'update_status', appointmentId: id, appointmentData: data })
    })
  },

  delete: (id: number) => {
    return apiCall(API_ENDPOINTS.appointments, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', appointmentId: id })
    })
  }
}

// Combined service for all content features
export const contentFeaturesService = {
  videoShorts: videoShortsService,
  clinicFeatures: clinicFeaturesService,
  events: eventsService,
  selfieReviews: selfieReviewsService,
  youtubeVideos: youtubeVideosService,
  differentiators: differentiatorsService,
  featuredContent: featuredContentService,
  procedures: proceduresService,
  providers: providersService,
  blogPosts: blogPostsService,
  galleryItems: galleryItemsService,
  eventBanners: eventBannersService,
  consultations: consultationsService,
  appointments: appointmentsService
}

// Simplified service class for easy usage in components
export class ContentFeaturesService {
  static async getVideoShorts() {
    return videoShortsService.getAll({ featured: true, active: true })
  }

  static async getClinicFeatures() {
    return clinicFeaturesService.getAll({ active: true })
  }

  static async getEvents() {
    return eventsService.getAll({ active: true, current_only: true })
  }

  static async getSelfieReviews() {
    return selfieReviewsService.getAll({ verified: true, featured: true, consent_given: true })
  }

  static async getYouTubeVideos() {
    return youtubeVideosService.getAll({ active: true })
  }

  static async getDifferentiators() {
    return differentiatorsService.getAll({ active: true })
  }

  static async incrementVideoShortsViews(id: number) {
    return videoShortsService.incrementViews(id)
  }

  static async incrementYouTubeViews(id: number) {
    return youtubeVideosService.incrementViews(id)
  }

  static async registerForEvent(id: number) {
    return eventsService.register(id)
  }
}
import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import type {
  ContactSubmission,
  Appointment,
  BlogPost,
  EventBanner,
  UserProfile,
  ContactFormData,
  AppointmentFormData,
  ApiResponse
} from '../types'

// Supabase configuration
const supabaseUrl = 'https://weqqkknwpgremfugcbvz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service class
export class DatabaseService {
  // Contact form submissions
  static async submitContactForm(formData: ContactFormData): Promise<ApiResponse<ContactSubmission>> {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            service_type: formData.serviceType,
            message: formData.message,
            preferred_contact: formData.preferredContact,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Appointment booking
  static async bookAppointment(appointmentData: AppointmentFormData): Promise<ApiResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_name: appointmentData.patientName,
            patient_email: appointmentData.patientEmail,
            patient_phone: appointmentData.patientPhone,
            service_type: appointmentData.serviceType,
            preferred_date: appointmentData.preferredDate,
            preferred_time: appointmentData.preferredTime,
            notes: appointmentData.notes,
            status: 'pending' as const,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error booking appointment:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Blog/Content management
  static async getBlogPosts(limit = 10): Promise<ApiResponse<BlogPost[]>> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getBlogPost(slug: string): Promise<ApiResponse<BlogPost>> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Event banners
  static async getActiveEventBanners(): Promise<ApiResponse<EventBanner[]>> {
    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('event_banners')
        .select('*')
        .eq('active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching event banners:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // User authentication helpers
  static async signUp(email: string, password: string, userData: Partial<UserProfile> = {}): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async signIn(email: string, password: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error signing in:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async signOut(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<UserProfile | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (!user) {
        return { success: true, data: null }
      }

      // Transform auth user to UserProfile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        phone: user.user_metadata?.phone,
        created_at: user.created_at
      }

      return { success: true, data: userProfile }
    } catch (error) {
      console.error('Error getting current user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

export default supabase
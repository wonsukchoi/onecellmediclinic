// Enhanced Supabase Configuration and Client Setup for OneCell Medical Clinic
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://weqqkknwpgremfugcbvz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg';

// Database Types
export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone?: string;
          service_type?: string;
          message?: string;
          preferred_contact: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contact_submissions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contact_submissions']['Insert']>;
      };
      appointments: {
        Row: {
          id: number;
          patient_name: string;
          patient_email: string;
          patient_phone?: string;
          service_type: string;
          procedure_id?: number;
          provider_id?: number;
          preferred_date: string;
          preferred_time: string;
          duration_minutes?: number;
          appointment_type?: string;
          total_cost?: number;
          deposit_amount?: number;
          payment_status?: string;
          confirmation_code?: string;
          notes?: string;
          status: string;
          assigned_doctor?: string;
          reminder_sent?: boolean;
          cancellation_reason?: string;
          rescheduled_from?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      procedures: {
        Row: {
          id: number;
          category_id?: number;
          name: string;
          slug: string;
          description?: string;
          detailed_description?: string;
          duration_minutes?: number;
          price_range?: string;
          preparation_instructions?: string;
          recovery_time?: string;
          featured_image_url?: string;
          gallery_images?: string[];
          active: boolean;
          display_order: number;
          tags?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['procedures']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['procedures']['Insert']>;
      };
      providers: {
        Row: {
          id: number;
          user_id?: string;
          full_name: string;
          title?: string;
          specialization?: string;
          bio?: string;
          profile_image_url?: string;
          years_experience?: number;
          education?: string[];
          certifications?: string[];
          languages?: string[];
          consultation_fee?: number;
          active: boolean;
          availability_schedule?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['providers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['providers']['Insert']>;
      };
      consultation_requests: {
        Row: {
          id: number;
          patient_name: string;
          patient_email: string;
          patient_phone?: string;
          patient_age?: number;
          consultation_type: string;
          procedure_interest?: string;
          concerns?: string;
          medical_history?: string;
          current_medications?: string;
          preferred_contact_method: string;
          urgency_level: string;
          photos?: string[];
          status: string;
          assigned_provider_id?: number;
          response_notes?: string;
          estimated_cost_range?: string;
          recommended_procedures?: string[];
          follow_up_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consultation_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['consultation_requests']['Insert']>;
      };
      gallery_items: {
        Row: {
          id: number;
          procedure_id?: number;
          provider_id?: number;
          title?: string;
          description?: string;
          before_image_url: string;
          after_image_url: string;
          additional_images?: string[];
          patient_age_range?: string;
          procedure_date?: string;
          recovery_weeks?: number;
          patient_testimonial?: string;
          consent_given: boolean;
          featured: boolean;
          display_order: number;
          tags?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gallery_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['gallery_items']['Insert']>;
      };
    };
    Functions: {
      check_provider_availability: {
        Args: {
          provider_id_param: number;
          requested_date: string;
          requested_time: string;
          duration_minutes_param?: number;
        };
        Returns: boolean;
      };
      generate_confirmation_code: {
        Args: {};
        Returns: string;
      };
    };
  };
}

// Create typed Supabase client
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enhanced database helper functions with TypeScript support
export const db = {
  // Contact form submissions
  async submitContactForm(formData: {
    name: string;
    email: string;
    phone?: string;
    serviceType?: string;
    message?: string;
    preferredContact?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
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
            preferred_contact: formData.preferredContact || 'email'
            // status: 'new' is handled by database DEFAULT
            // created_at and updated_at are handled by database DEFAULT NOW()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Enhanced appointment booking (now recommends using Edge Function)
  async bookAppointment(appointmentData: {
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    serviceType: string;
    procedureId?: number;
    providerId?: number;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
    appointmentType?: string;
    durationMinutes?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    console.warn('Consider using the book-appointment Edge Function for enhanced functionality');

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_name: appointmentData.patientName,
            patient_email: appointmentData.patientEmail,
            patient_phone: appointmentData.patientPhone,
            service_type: appointmentData.serviceType,
            procedure_id: appointmentData.procedureId,
            provider_id: appointmentData.providerId,
            preferred_date: appointmentData.preferredDate,
            preferred_time: appointmentData.preferredTime,
            notes: appointmentData.notes,
            appointment_type: appointmentData.appointmentType || 'consultation',
            duration_minutes: appointmentData.durationMinutes || 60,
            status: 'pending'
          }
        ])
        .select('*')
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error booking appointment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Procedure management
  async getProcedures(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select(`
          *,
          procedure_categories(
            id,
            name,
            description
          )
        `)
        .eq('active', true)
        .order('display_order')
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching procedures:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getProcedureBySlug(slug: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select(`
          *,
          procedure_categories(
            id,
            name,
            description
          ),
          procedure_providers(
            providers(
              id,
              full_name,
              title,
              specialization,
              profile_image_url
            )
          )
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching procedure:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Provider management
  async getProviders(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          procedure_providers(
            procedures(
              id,
              name,
              slug
            )
          )
        `)
        .eq('active', true)
        .order('full_name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching providers:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Gallery management
  async getGalleryItems(filters?: {
    procedureId?: number;
    providerId?: number;
    featured?: boolean;
    limit?: number;
  }): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      let query = supabase
        .from('gallery_items')
        .select(`
          *,
          procedures(
            id,
            name,
            slug
          ),
          providers(
            id,
            full_name,
            title
          )
        `)
        .eq('consent_given', true)
        .order('featured', { ascending: false })
        .order('display_order')
        .order('created_at', { ascending: false });

      if (filters?.procedureId) {
        query = query.eq('procedure_id', filters.procedureId);
      }

      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Blog/Content management (legacy functions)
  async getBlogPosts(limit = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getBlogPost(slug: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Event banners
  async getActiveEventBanners(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('event_banners')
        .select('*')
        .eq('active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching event banners:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Enhanced authentication helpers
  async signUp(email: string, password: string, userData: Record<string, any> = {}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async signIn(email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Real-time subscriptions
  subscribeToConsultationRequests(callback: (payload: any) => void) {
    return supabase
      .channel('consultation_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultation_requests'
      }, callback)
      .subscribe();
  },

  subscribeToAppointments(callback: (payload: any) => void) {
    return supabase
      .channel('appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, callback)
      .subscribe();
  },

  subscribeToAvailability(callback: (payload: any) => void) {
    return supabase
      .channel('appointment_availability')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointment_availability'
      }, callback)
      .subscribe();
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Edge Functions helper
export const edgeFunctions = {
  baseUrl: `${supabaseUrl}/functions/v1`,

  async call(functionName: string, payload?: any, options?: RequestInit): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return fetch(`${this.baseUrl}/${functionName}`, {
      method: 'POST',
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
      ...options,
    });
  }
};

export default supabase;
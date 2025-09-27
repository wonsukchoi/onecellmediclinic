import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import type {
  ContactSubmission,
  Appointment,
  BlogPost,
  EventBanner,
  UserProfile,
  ContactFormData,
  AppointmentFormData,
  ApiResponse,
} from "../types";

// Supabase configuration
const supabaseUrl = "https://weqqkknwpgremfugcbvz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg";

// Create Supabase client with proper session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "onecell-clinic-auth-token",
    flowType: "pkce",
  },
});

// Database service class
export class DatabaseService {
  // Contact form submissions
  static async submitContactForm(
    formData: ContactFormData
  ): Promise<ApiResponse<ContactSubmission>> {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/submit-contact-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            serviceType: formData.serviceType,
            message: formData.message,
            preferredContact: formData.preferredContact || "email",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Edge function returned failure");
      }

      // Map the edge function response to match our expected ContactSubmission type
      const contactSubmission: ContactSubmission = {
        id: result.trackingId,
        name: result.submission.name,
        email: result.submission.email,
        phone: result.submission.phone,
        service_type: result.submission.service_type,
        message: result.submission.message,
        preferred_contact: result.submission.preferred_contact,
        created_at: result.submission.created_at,
      };

      return { success: true, data: contactSubmission };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Appointment booking
  static async bookAppointment(
    appointmentData: AppointmentFormData
  ): Promise<ApiResponse<Appointment>> {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/manage-appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            action: "book",
            appointmentData: {
              patientName: appointmentData.patientName,
              patientEmail: appointmentData.patientEmail,
              patientPhone: appointmentData.patientPhone,
              serviceType: appointmentData.serviceType,
              preferredDate: appointmentData.preferredDate,
              preferredTime: appointmentData.preferredTime,
              notes: appointmentData.notes,
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Edge function returned failure");
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error booking appointment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Blog/Content management
  static async getBlogPosts(limit = 10): Promise<ApiResponse<BlogPost[]>> {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/manage-blog-posts?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Edge function returned failure");
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getBlogPost(slug: string): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/manage-blog-posts?slug=${slug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Edge function returned failure");
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Event banners
  static async getActiveEventBanners(): Promise<ApiResponse<EventBanner[]>> {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/manage-event-banners`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Edge function returned failure");
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("Error fetching event banners:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // User authentication helpers
  static async signUp(
    email: string,
    password: string,
    userData: Partial<UserProfile> = {}
  ): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error signing up:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async signIn(email: string, password: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error signing in:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async signOut(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<UserProfile | null>> {
    try {
      // First check for existing session with proper error handling
      let {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("test", session);
      if (sessionError) {
        console.warn("Session error:", sessionError.message);
        // Don't throw immediately, try to refresh session
        if (sessionError.message.includes("Auth session missing")) {
          // Attempt to refresh session
          const {
            data: { session: refreshedSession },
            error: refreshError,
          } = await supabase.auth.refreshSession();
          if (refreshError || !refreshedSession) {
            return { success: true, data: null };
          }
          // Use refreshed session
          session = refreshedSession;
        } else {
          throw sessionError;
        }
      }

      // If no session, return null
      if (!session) {
        return { success: true, data: null };
      }

      // Verify session is still valid
      if (
        session.expires_at &&
        session.expires_at < Math.floor(Date.now() / 1000)
      ) {
        console.warn("Session expired, attempting refresh");
        const {
          data: { session: refreshedSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession) {
          return { success: true, data: null };
        }
        session = refreshedSession;
      }

      // Get user from current session
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.warn("User fetch error:", error.message);
        // If user fetch fails but we have a session, try to clear auth state
        if (error.message.includes("Auth session missing")) {
          await supabase.auth.signOut();
          return { success: true, data: null };
        }
        throw error;
      }

      if (!user) {
        return { success: true, data: null };
      }

      // Check if user has admin role (for demo purposes, let's check email)
      // In production, this should come from a user_profiles table or user metadata
      const isAdmin =
        user.email === "admin@onecellclinic.com" ||
        user.user_metadata?.role === "admin" ||
        user.email?.includes("admin");

      // Transform auth user to UserProfile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        phone: user.user_metadata?.phone,
        role: isAdmin ? "admin" : "user",
        created_at: user.created_at,
      };

      return { success: true, data: userProfile };
    } catch (error) {
      console.error("Error getting current user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Auth state change listener
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;

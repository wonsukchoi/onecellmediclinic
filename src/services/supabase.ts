import { createClient, SupabaseClient } from "@supabase/supabase-js";
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
  HeroCarousel,
} from "../types";

// Supabase configuration
const supabaseUrl = "https://weqqkknwpgremfugcbvz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg";

// Singleton pattern for Supabase client
export class SupabaseService {
  private static instance: SupabaseClient | null = null;
  private static publicInstance: SupabaseClient | null = null;

  static getClient(): SupabaseClient {
    if (!this.instance) {
      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          storageKey: "onecell-clinic-auth-token",
          flowType: "pkce",
        },
      });
    }
    return this.instance;
  }

  static getPublicClient(): SupabaseClient {
    if (!this.publicInstance) {
      this.publicInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
    }
    return this.publicInstance;
  }
}

// Export the main client instance
export const supabase = SupabaseService.getClient();

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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Hero carousel - Public endpoint (no auth required)
  static async getHeroCarousel(): Promise<ApiResponse<HeroCarousel[]>> {
    try {
      // Use the singleton public client to avoid multiple instances
      const publicClient = SupabaseService.getPublicClient();

      // Use the public function instead of direct table access
      const { data, error } = await publicClient.rpc("get_hero_carousel");

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<UserProfile | null>> {
    try {
      // First check for existing session with proper error handling
      const {
        data: { session: initialSession },
        error: sessionError,
      } = await supabase.auth.getSession();
      let session = initialSession;

      if (sessionError) {
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

// Admin Service class
export class AdminService {
  // Generic CRUD operations for admin entities
  static async getAll<T>(
    table: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      filters?: Record<string, unknown>;
      sort?: { field: string; direction: "asc" | "desc" };
    } = {}
  ): Promise<
    ApiResponse<{
      data: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    try {
      const { page = 1, limit = 50, search, filters = {}, sort } = params;

      let query = supabase.from(table).select("*", { count: "exact" });

      // Apply search
      if (search) {
        // Basic search across common text fields - this should be customized per table
        const searchFields = ["name", "title", "description", "email"];
        const searchConditions = searchFields
          .map((field) => `${field}.ilike.%${search}%`)
          .join(",");
        query = query.or(searchConditions);
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "boolean") {
            query = query.eq(key, value);
          } else if (typeof value === "string") {
            query = query.ilike(key, `%${value}%`);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, {
          ascending: sort.direction === "asc",
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: data as T[],
          total: count || 0,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getById<T>(
    table: string,
    id: number | string
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return { success: true, data: data as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async create<T>(
    table: string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: result as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async update<T>(
    table: string,
    id: number | string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: result as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async delete(
    table: string,
    id: number | string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get admin dashboard statistics
  static async getAdminStats(): Promise<ApiResponse<Record<string, number>>> {
    try {
      const tables = [
        "appointments",
        "consultation_requests",
        "contact_submissions",
        "procedures",
        "providers",
        "blog_posts",
        "gallery_items",
        "video_shorts",
        "youtube_videos",
        "selfie_reviews",
        "event_banners",
      ];

      const statsPromises = tables.map(async (table) => {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        return { table, count: count || 0 };
      });

      const results = await Promise.all(statsPromises);
      const stats = results.reduce((acc, { table, count }) => {
        acc[table] = count;
        return acc;
      }, {} as Record<string, number>);

      // Get today's appointments
      const today = new Date().toISOString().split("T")[0];
      const { count: todayAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("preferred_date", today)
        .lt("preferred_date", `${today}T23:59:59`);

      // Get pending appointments
      const { count: pendingAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get new consultations (last 24 hours)
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();
      const { count: newConsultations } = await supabase
        .from("consultation_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday);

      // Get new contact submissions (last 24 hours)
      const { count: newContactSubmissions } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday);

      const adminStats = {
        totalAppointments: stats.appointments || 0,
        pendingAppointments: pendingAppointments || 0,
        todayAppointments: todayAppointments || 0,
        totalConsultations: stats.consultation_requests || 0,
        newConsultations: newConsultations || 0,
        totalContactSubmissions: stats.contact_submissions || 0,
        newContactSubmissions: newContactSubmissions || 0,
        totalProcedures: stats.procedures || 0,
        totalProviders: stats.providers || 0,
        totalBlogPosts: stats.blog_posts || 0,
        totalGalleryItems: stats.gallery_items || 0,
        totalVideoShorts: stats.video_shorts || 0,
        totalYouTubeVideos: stats.youtube_videos || 0,
        totalSelfieReviews: stats.selfie_reviews || 0,
        totalEventBanners: stats.event_banners || 0,
      };

      return { success: true, data: adminStats };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Upload file to Supabase storage
  static async uploadFile(
    bucket: string,
    file: File,
    path?: string
  ): Promise<ApiResponse<string>> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName =
        path ||
        `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      return { success: true, data: publicUrl };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Bulk operations
  static async bulkDelete(
    table: string,
    ids: (number | string)[]
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from(table).delete().in("id", ids);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async bulkUpdate<T>(
    table: string,
    updates: { id: number | string; data: Partial<T> }[]
  ): Promise<ApiResponse<void>> {
    try {
      const promises = updates.map(({ id, data }) =>
        supabase.from(table).update(data).eq("id", id)
      );

      await Promise.all(promises);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default supabase;

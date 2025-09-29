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
import {
  getAuthStateFast,
  getAuthHeadersFast,
  SUPABASE_CONFIG,
  clearSessionCache,
} from "../utils/fast-auth";

// Singleton pattern for Supabase client
export class SupabaseService {
  private static instance: SupabaseClient | null = null;
  private static publicInstance: SupabaseClient | null = null;

  static getClient(): SupabaseClient {
    if (!this.instance) {
      this.instance = createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage:
              typeof window !== "undefined" ? window.localStorage : undefined,
            storageKey: "onecell-clinic-auth-token",
            flowType: "pkce",
          },
        }
      );
    }
    return this.instance;
  }

  static getPublicClient(): SupabaseClient {
    if (!this.publicInstance) {
      this.publicInstance = createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );
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
        `${SUPABASE_CONFIG.url}/functions/v1/submit-contact-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
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
        `${SUPABASE_CONFIG.url}/functions/v1/manage-appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
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
        `${SUPABASE_CONFIG.url}/functions/v1/manage-blog-posts?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
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
        `${SUPABASE_CONFIG.url}/functions/v1/manage-blog-posts?slug=${slug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
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
        `${SUPABASE_CONFIG.url}/functions/v1/manage-event-banners`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
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
      // Clear the session cache when user logs out
      clearSessionCache();

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
      // Use fast auth check first for maximum performance
      const authState = getAuthStateFast();

      if (!authState.user || authState.isExpired) {
        return { success: true, data: null };
      }

      const user = authState.user;

      // Check if user has admin role
      const isAdmin =
        user.email === "admin@onecellclinic.com" ||
        user.user_metadata?.role === "admin" ||
        user.email?.includes("admin");

      // Transform auth user to UserProfile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        full_name: (user.user_metadata?.name ||
          user.user_metadata?.full_name) as string | undefined,
        phone: user.user_metadata?.phone as string | undefined,
        role: isAdmin ? "admin" : "patient",
        created_at: user.created_at as string | undefined,
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "get_all",
            table,
            params,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "get_by_id",
            table,
            id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get record");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "create",
            table,
            data,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create record");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "update",
            table,
            id,
            data,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update record");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "delete",
            table,
            id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete record");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "get_admin_stats",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get admin stats");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "bulk_delete",
            table,
            params: { ids },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to bulk delete");
      }

      return result;
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
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/admin-operations`,
        {
          method: "POST",
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: "bulk_update",
            table,
            params: { updates },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to bulk update");
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default supabase;

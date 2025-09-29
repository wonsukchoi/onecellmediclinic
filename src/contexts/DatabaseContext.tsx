import React, { createContext, useContext, ReactNode } from "react";
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
import { SUPABASE_CONFIG, clearAuthCache, getUserCached } from "../utils/fast-auth";
import { useSupabase } from "./SupabaseContext";

interface DatabaseContextType {
  submitContactForm: (formData: ContactFormData) => Promise<ApiResponse<ContactSubmission>>;
  bookAppointment: (appointmentData: AppointmentFormData) => Promise<ApiResponse<Appointment>>;
  getBlogPosts: (limit?: number) => Promise<ApiResponse<BlogPost[]>>;
  getBlogPost: (slug: string) => Promise<ApiResponse<BlogPost>>;
  getActiveEventBanners: () => Promise<ApiResponse<EventBanner[]>>;
  getHeroCarousel: () => Promise<ApiResponse<HeroCarousel[]>>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<ApiResponse>;
  signIn: (email: string, password: string) => Promise<ApiResponse>;
  signOut: () => Promise<ApiResponse>;
  getCurrentUser: () => Promise<ApiResponse<UserProfile | null>>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const { client, publicClient } = useSupabase();

  const submitContactForm = async (formData: ContactFormData): Promise<ApiResponse<ContactSubmission>> => {
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
  };

  const bookAppointment = async (appointmentData: AppointmentFormData): Promise<ApiResponse<Appointment>> => {
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
  };

  const getBlogPosts = async (limit = 10): Promise<ApiResponse<BlogPost[]>> => {
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
  };

  const getBlogPost = async (slug: string): Promise<ApiResponse<BlogPost>> => {
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
  };

  const getActiveEventBanners = async (): Promise<ApiResponse<EventBanner[]>> => {
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
  };

  const getHeroCarousel = async (): Promise<ApiResponse<HeroCarousel[]>> => {
    try {
      const { data, error } = await publicClient.rpc("get_hero_carousel");

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile> = {}
  ): Promise<ApiResponse> => {
    try {
      const { data, error } = await client.auth.signUp({
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
  };

  const signIn = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      const { data, error } = await client.auth.signInWithPassword({
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
  };

  const signOut = async (): Promise<ApiResponse> => {
    try {
      clearAuthCache();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const getCurrentUser = async (): Promise<ApiResponse<UserProfile | null>> => {
    try {
      const { data: { user }, error } = await getUserCached(client);

      if (error) throw error;

      if (!user) {
        return { success: true, data: null };
      }

      const isAdmin =
        user.email === "admin@onecellclinic.com" ||
        user.user_metadata?.role === "admin" ||
        user.email?.includes("admin");

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
  };

  const value: DatabaseContextType = {
    submitContactForm,
    bookAppointment,
    getBlogPosts,
    getBlogPost,
    getActiveEventBanners,
    getHeroCarousel,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

export default DatabaseContext;
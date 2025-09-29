import React, { createContext, useContext, ReactNode } from "react";
import { getAuthHeaders, SUPABASE_CONFIG } from "../utils/fast-auth";
import { useSupabase } from "./SupabaseContext";

interface VideoShort {
  id: number;
  title: string;
  description?: string;
  category?: string;
  featured: boolean;
  active: boolean;
  url: string;
  thumbnail_url?: string;
  order_index: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface ClinicFeature {
  id: number;
  title: string;
  description: string;
  category?: string;
  active: boolean;
  icon?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  featured: boolean;
  active: boolean;
  registration_count: number;
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

interface SelfieReview {
  id: number;
  procedure_type: string;
  before_image_url?: string;
  after_image_url?: string;
  review_text?: string;
  rating: number;
  verified: boolean;
  featured: boolean;
  moderation_status: string;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
}

interface YoutubeVideo {
  id: number;
  title: string;
  description?: string;
  category?: string;
  featured: boolean;
  active: boolean;
  youtube_url: string;
  video_id: string;
  thumbnail_url?: string;
  duration?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface Differentiator {
  id: number;
  title: string;
  description: string;
  icon?: string;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

interface ReorderItem {
  id: number;
  order_index: number;
}

interface FeaturesContextType {
  getVideoShorts: () => Promise<VideoShort[]>;
  getClinicFeatures: () => Promise<ClinicFeature[]>;
  getEvents: () => Promise<Event[]>;
  getSelfieReviews: () => Promise<SelfieReview[]>;
  getYouTubeVideos: () => Promise<YoutubeVideo[]>;
  getDifferentiators: () => Promise<Differentiator[]>;
  incrementVideoShortsViews: (id: number) => Promise<ApiResponse<unknown>>;
  incrementYouTubeViews: (id: number) => Promise<ApiResponse<unknown>>;
  registerForEvent: (id: number) => Promise<ApiResponse<unknown>>;

  videoShorts: {
    getAll: (params?: { category?: string; featured?: boolean; active?: boolean }) => Promise<VideoShort[]>;
    getById: (id: number) => Promise<VideoShort>;
    create: (data: any) => Promise<VideoShort>;
    update: (id: number, data: any) => Promise<VideoShort>;
    delete: (id: number) => Promise<void>;
    reorder: (items: ReorderItem[]) => Promise<void>;
  };

  clinicFeatures: {
    getAll: (params?: { category?: string; active?: boolean }) => Promise<ClinicFeature[]>;
    getById: (id: number) => Promise<ClinicFeature>;
    create: (data: any) => Promise<ClinicFeature>;
    update: (id: number, data: any) => Promise<ClinicFeature>;
    delete: (id: number) => Promise<void>;
    reorder: (items: ReorderItem[]) => Promise<void>;
  };

  events: {
    getAll: (params?: { event_type?: string; featured?: boolean; active?: boolean; current_only?: boolean }) => Promise<Event[]>;
    getById: (id: number) => Promise<Event>;
    create: (data: any) => Promise<Event>;
    update: (id: number, data: any) => Promise<Event>;
    delete: (id: number) => Promise<void>;
    register: (id: number) => Promise<void>;
    getAnalytics: (id: number) => Promise<any>;
  };

  selfieReviews: {
    getAll: (params?: { procedure_type?: string; verified?: boolean; featured?: boolean; moderation_status?: string; consent_given?: boolean }) => Promise<SelfieReview[]>;
    getById: (id: number) => Promise<SelfieReview>;
    create: (data: any) => Promise<SelfieReview>;
    update: (id: number, data: any) => Promise<SelfieReview>;
    delete: (id: number) => Promise<void>;
    moderate: (id: number, status: string, notes?: string) => Promise<void>;
    feature: (id: number, featured: boolean) => Promise<void>;
    getStatistics: () => Promise<any>;
  };

  youtubeVideos: {
    getAll: (params?: { category?: string; featured?: boolean; active?: boolean }) => Promise<YoutubeVideo[]>;
    getById: (id: number) => Promise<YoutubeVideo>;
    create: (data: any) => Promise<YoutubeVideo>;
    update: (id: number, data: any) => Promise<YoutubeVideo>;
    delete: (id: number) => Promise<void>;
    refreshDetails: (id: number) => Promise<void>;
  };

  differentiators: {
    getAll: (params?: { active?: boolean }) => Promise<Differentiator[]>;
    getById: (id: number) => Promise<Differentiator>;
    create: (data: any) => Promise<Differentiator>;
    update: (id: number, data: any) => Promise<Differentiator>;
    delete: (id: number) => Promise<void>;
    reorder: (items: ReorderItem[]) => Promise<void>;
    toggleActive: (id: number) => Promise<void>;
  };
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

interface FeaturesProviderProps {
  children: ReactNode;
}

export const FeaturesProvider: React.FC<FeaturesProviderProps> = ({ children }) => {
  const { publicClient } = useSupabase();

  const API_ENDPOINTS = {
    videoShorts: `${SUPABASE_CONFIG.url}/functions/v1/manage-video-shorts`,
    features: `${SUPABASE_CONFIG.url}/functions/v1/manage-features`,
    events: `${SUPABASE_CONFIG.url}/functions/v1/manage-events`,
    selfieReviews: `${SUPABASE_CONFIG.url}/functions/v1/manage-selfie-reviews`,
    youtubeVideos: `${SUPABASE_CONFIG.url}/functions/v1/manage-youtube-videos`,
    differentiators: `${SUPABASE_CONFIG.url}/functions/v1/manage-differentiators`,
    featuredContent: `${SUPABASE_CONFIG.url}/functions/v1/get-featured-content`,
  };

  const getAuthHeaders = async () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    };
  };

  const getAuthHeadersLoggedin = () => {
    return getAuthHeaders();
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(endpoint, {
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || result;
    } catch (error) {
      throw error;
    }
  };

  const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const authHeaders = getAuthHeadersLoggedin();
      const response = await fetch(endpoint, {
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || result;
    } catch (error) {
      throw error;
    }
  };

  const getVideoShorts = async (): Promise<VideoShort[]> => {
    try {
      return await apiCall(`${API_ENDPOINTS.videoShorts}?featured=true&active=true`);
    } catch {
      const { data, error } = await publicClient
        .from("video_shorts")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data || [];
    }
  };

  const getClinicFeatures = async (): Promise<ClinicFeature[]> => {
    try {
      return await apiCall(`${API_ENDPOINTS.features}?active=true`);
    } catch {
      const { data, error } = await publicClient
        .from("clinic_features")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data || [];
    }
  };

  const getEvents = async (): Promise<Event[]> => {
    try {
      return await apiCall(`${API_ENDPOINTS.events}?active=true&current_only=true`);
    } catch {
      const currentDate = new Date().toISOString();
      const { data, error } = await publicClient
        .from("events")
        .select("*")
        .eq("active", true)
        .gte("end_date", currentDate)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data || [];
    }
  };

  const getSelfieReviews = async (): Promise<SelfieReview[]> => {
    try {
      return await apiCall(`${API_ENDPOINTS.selfieReviews}?verified=true&featured=true&consent_given=true`);
    } catch {
      const { data, error } = await publicClient
        .from("selfie_reviews")
        .select("*")
        .eq("verified", true)
        .eq("consent_given", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(9);

      if (error) throw error;
      return data || [];
    }
  };

  const getYouTubeVideos = async (): Promise<YoutubeVideo[]> => {
    try {
      return await apiCall(`${API_ENDPOINTS.youtubeVideos}?active=true`);
    } catch {
      const { data, error } = await publicClient
        .from("youtube_videos")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    }
  };

  const getDifferentiators = async (): Promise<Differentiator[]> => {
    try {
      return await apiCall(`${API_ENDPOINTS.differentiators}?active=true`);
    } catch {
      const { data, error } = await publicClient
        .from("differentiators")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data || [];
    }
  };

  const incrementVideoShortsViews = async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      await apiCall(`${API_ENDPOINTS.videoShorts}?action=increment_views&id=${id}`, { method: "PATCH" });
      return { success: true };
    } catch {
      return { success: false, error: "View increment not available" };
    }
  };

  const incrementYouTubeViews = async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      await apiCall(`${API_ENDPOINTS.youtubeVideos}?action=increment_views&id=${id}`, { method: "PATCH" });
      return { success: true };
    } catch {
      return { success: false, error: "View increment not available" };
    }
  };

  const registerForEvent = async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      await authenticatedApiCall(`${API_ENDPOINTS.events}?action=register&id=${id}`, { method: "PATCH" });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const videoShorts = {
    getAll: async (params?: { category?: string; featured?: boolean; active?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set("category", params.category);
      if (params?.featured !== undefined) searchParams.set("featured", params.featured.toString());
      if (params?.active !== undefined) searchParams.set("active", params.active.toString());

      return apiCall(`${API_ENDPOINTS.videoShorts}?${searchParams.toString()}`);
    },
    getById: async (id: number) => apiCall(`${API_ENDPOINTS.videoShorts}?id=${id}`),
    create: async (data: any) => authenticatedApiCall(API_ENDPOINTS.videoShorts, { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => authenticatedApiCall(`${API_ENDPOINTS.videoShorts}?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.videoShorts}?id=${id}`, { method: "DELETE" }),
    reorder: async (items: ReorderItem[]) => authenticatedApiCall(`${API_ENDPOINTS.videoShorts}?action=reorder`, { method: "PATCH", body: JSON.stringify({ items }) }),
  };

  const clinicFeatures = {
    getAll: async (params?: { category?: string; active?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set("category", params.category);
      if (params?.active !== undefined) searchParams.set("active", params.active.toString());

      return apiCall(`${API_ENDPOINTS.features}?${searchParams.toString()}`);
    },
    getById: async (id: number) => apiCall(`${API_ENDPOINTS.features}?id=${id}`),
    create: async (data: any) => authenticatedApiCall(API_ENDPOINTS.features, { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => authenticatedApiCall(`${API_ENDPOINTS.features}?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.features}?id=${id}`, { method: "DELETE" }),
    reorder: async (items: ReorderItem[]) => authenticatedApiCall(`${API_ENDPOINTS.features}?action=reorder`, { method: "PATCH", body: JSON.stringify({ items }) }),
  };

  const events = {
    getAll: async (params?: { event_type?: string; featured?: boolean; active?: boolean; current_only?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.event_type) searchParams.set("event_type", params.event_type);
      if (params?.featured !== undefined) searchParams.set("featured", params.featured.toString());
      if (params?.active !== undefined) searchParams.set("active", params.active.toString());
      if (params?.current_only !== undefined) searchParams.set("current_only", params.current_only.toString());

      return apiCall(`${API_ENDPOINTS.events}?${searchParams.toString()}`);
    },
    getById: async (id: number) => apiCall(`${API_ENDPOINTS.events}?id=${id}`),
    create: async (data: any) => authenticatedApiCall(API_ENDPOINTS.events, { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => authenticatedApiCall(`${API_ENDPOINTS.events}?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.events}?id=${id}`, { method: "DELETE" }),
    register: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.events}?action=register&id=${id}`, { method: "PATCH" }),
    getAnalytics: async (id: number) => apiCall(`${API_ENDPOINTS.events}?action=analytics&id=${id}`),
  };

  const selfieReviews = {
    getAll: async (params?: { procedure_type?: string; verified?: boolean; featured?: boolean; moderation_status?: string; consent_given?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.procedure_type) searchParams.set("procedure_type", params.procedure_type);
      if (params?.verified !== undefined) searchParams.set("verified", params.verified.toString());
      if (params?.featured !== undefined) searchParams.set("featured", params.featured.toString());
      if (params?.moderation_status) searchParams.set("moderation_status", params.moderation_status);
      if (params?.consent_given !== undefined) searchParams.set("consent_given", params.consent_given.toString());

      return apiCall(`${API_ENDPOINTS.selfieReviews}?${searchParams.toString()}`);
    },
    getById: async (id: number) => apiCall(`${API_ENDPOINTS.selfieReviews}?id=${id}`),
    create: async (data: any) => authenticatedApiCall(API_ENDPOINTS.selfieReviews, { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => authenticatedApiCall(`${API_ENDPOINTS.selfieReviews}?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.selfieReviews}?id=${id}`, { method: "DELETE" }),
    moderate: async (id: number, status: string, notes?: string) => authenticatedApiCall(`${API_ENDPOINTS.selfieReviews}?action=moderate&id=${id}`, { method: "PATCH", body: JSON.stringify({ status, notes }) }),
    feature: async (id: number, featured: boolean) => authenticatedApiCall(`${API_ENDPOINTS.selfieReviews}?action=feature&id=${id}`, { method: "PATCH", body: JSON.stringify({ featured }) }),
    getStatistics: async () => apiCall(`${API_ENDPOINTS.selfieReviews}?action=statistics`),
  };

  const youtubeVideos = {
    getAll: async (params?: { category?: string; featured?: boolean; active?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set("category", params.category);
      if (params?.featured !== undefined) searchParams.set("featured", params.featured.toString());
      if (params?.active !== undefined) searchParams.set("active", params.active.toString());

      return apiCall(`${API_ENDPOINTS.youtubeVideos}?${searchParams.toString()}`);
    },
    getById: async (id: number) => apiCall(`${API_ENDPOINTS.youtubeVideos}?id=${id}`),
    create: async (data: any) => authenticatedApiCall(API_ENDPOINTS.youtubeVideos, { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => authenticatedApiCall(`${API_ENDPOINTS.youtubeVideos}?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.youtubeVideos}?id=${id}`, { method: "DELETE" }),
    refreshDetails: async (id: number) => apiCall(`${API_ENDPOINTS.youtubeVideos}?action=refresh_details&id=${id}`, { method: "PATCH" }),
  };

  const differentiators = {
    getAll: async (params?: { active?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.active !== undefined) searchParams.set("active", params.active.toString());

      return apiCall(`${API_ENDPOINTS.differentiators}?${searchParams.toString()}`);
    },
    getById: async (id: number) => apiCall(`${API_ENDPOINTS.differentiators}?id=${id}`),
    create: async (data: any) => authenticatedApiCall(API_ENDPOINTS.differentiators, { method: "POST", body: JSON.stringify(data) }),
    update: async (id: number, data: any) => authenticatedApiCall(`${API_ENDPOINTS.differentiators}?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.differentiators}?id=${id}`, { method: "DELETE" }),
    reorder: async (items: ReorderItem[]) => authenticatedApiCall(`${API_ENDPOINTS.differentiators}?action=reorder`, { method: "PATCH", body: JSON.stringify({ items }) }),
    toggleActive: async (id: number) => authenticatedApiCall(`${API_ENDPOINTS.differentiators}?action=toggle_active&id=${id}`, { method: "PATCH" }),
  };

  const value: FeaturesContextType = {
    getVideoShorts,
    getClinicFeatures,
    getEvents,
    getSelfieReviews,
    getYouTubeVideos,
    getDifferentiators,
    incrementVideoShortsViews,
    incrementYouTubeViews,
    registerForEvent,
    videoShorts,
    clinicFeatures,
    events,
    selfieReviews,
    youtubeVideos,
    differentiators,
  };

  return (
    <FeaturesContext.Provider value={value}>
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeatures = (): FeaturesContextType => {
  const context = useContext(FeaturesContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeaturesProvider");
  }
  return context;
};

export default FeaturesContext;
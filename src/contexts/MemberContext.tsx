import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserProfile, ApiResponse } from "../types";
import {
  getAuthStateFast,
  clearAuthFast,
  getUserCached,
} from "../utils/fast-auth";
import { useSupabase } from "./SupabaseContext";
import { useAuthState } from "./AuthStateContext";

interface MemberContextType {
  member: UserProfile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<ApiResponse>;
  signUp: (signupData: any) => Promise<ApiResponse>;
  signOut: () => Promise<ApiResponse>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<ApiResponse>;
  refreshMember: () => Promise<void>;
  resetPassword: (email: string) => Promise<ApiResponse>;
  verifyEmail: (token: string) => Promise<ApiResponse>;
  uploadAvatar: (file: File) => Promise<ApiResponse<string>>;
  resendVerificationEmail: () => Promise<ApiResponse>;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [member, setMember] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseContext = useSupabase();
  const supabase = supabaseContext?.client;
  const authState = useAuthState();

  useEffect(() => {
    if (!supabase) return;

    // Subscribe to unified auth state changes
    const unsubscribe = authState.onAuthEvent((event, session, user) => {
      if (event === 'SIGNED_IN' && session?.user) {
        void loadMemberProfile(session.user.id, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setMember(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Optionally refresh member profile on token refresh
        void loadMemberProfile(session.user.id, session.access_token);
      }
      setLoading(false);
    });

    // Initialize with current auth state if available
    if (authState.isInitialized) {
      if (authState.session?.user) {
        void loadMemberProfile(authState.session.user.id, authState.session.access_token);
      } else {
        setMember(null);
      }
      setLoading(false);
    } else {
      // Fallback to fast auth for immediate initialization
      void refreshMemberData();
    }

    return unsubscribe;
  }, [supabase, authState]);

  const refreshMemberData = async () => {
    setLoading(true);
    const auth = await getAuthStateFast();
    if (auth?.user?.id) {
      await loadMemberProfile(auth.user.id);
    }
    setLoading(false);
  };

  const loadMemberProfile = async (
    userId: string,
    jwt?: string | undefined
  ): Promise<void> => {
    if (!supabase) return;

    try {
      const {
        data: { user },
      } = jwt ? await supabase.auth.getUser(jwt) : await getUserCached(supabase);

      if (
        !user?.user_metadata?.role ||
        user?.user_metadata?.role === "member"
      ) {
        if (user) {
          const profileData = {
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata?.name || user.user_metadata?.full_name,
            phone: user.user_metadata?.phone,
            date_of_birth: user.user_metadata?.date_of_birth,
            gender: user.user_metadata?.gender,
            membership_type: (user.user_metadata?.membership_type as "basic" | "premium" | "vip") || "basic",
            member_since: user.created_at,
            total_visits: user.user_metadata?.total_visits || 0,
            profile_image_url: user.user_metadata?.profile_image_url,
          };
          setMember(profileData);
        }
      }
    } catch (error) {
      console.error("Error loading member profile:", error);
    }
  };


  // Profile creation is now handled via user metadata during signup
  // No separate edge function call is needed

  const signIn = async (
    email: string,
    password: string,
    _rememberMe?: boolean
  ): Promise<ApiResponse> => {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadMemberProfile(data.user.id, data.session?.access_token);
      }

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Sign in failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (signupData: any): Promise<ApiResponse> => {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            phone: signupData.phone,
            date_of_birth: signupData.dateOfBirth,
            gender: signupData.gender,
            role: "member",
          },
          emailRedirectTo: `${window.location.origin}/member/verify-email`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Profile data is already stored in user metadata during signup
        const profileData = {
          id: data.user.id,
          email: signupData.email,
          full_name: signupData.name,
          phone: signupData.phone,
          date_of_birth: signupData.dateOfBirth,
          gender: signupData.gender,
          membership_type: "basic" as const,
          member_since: new Date().toISOString(),
          total_visits: 0,
        };
        // No need to call createMemberProfile - user metadata is already set
        setMember(profileData);
      }

      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Sign up failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<ApiResponse> => {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearAuthFast();
      setMember(null);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Sign out failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    profileData: Partial<UserProfile>
  ): Promise<ApiResponse> => {
    if (!member || !supabase) {
      return { success: false, error: "No member logged in" };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...profileData,
          membership_type: profileData.membership_type || member.membership_type,
          total_visits: profileData.total_visits ?? member.total_visits,
        },
      });

      if (error) throw error;

      const updatedMember = { ...member, ...profileData };
      setMember(updatedMember);

      return { success: true, data: updatedMember };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An error occurred while updating profile",
      };
    }
  };

  const resetPassword = async (email: string): Promise<ApiResponse> => {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/member/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Password reset failed",
      };
    }
  };

  const verifyEmail = async (token: string): Promise<ApiResponse> => {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Email verification failed",
      };
    }
  };

  const uploadAvatar = async (file: File): Promise<ApiResponse<string>> => {
    if (!supabase || !member) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${member.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      await updateProfile({ profile_image_url: avatarUrl });

      return { success: true, data: avatarUrl };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Avatar upload failed",
      };
    }
  };

  const resendVerificationEmail = async (): Promise<ApiResponse> => {
    if (!supabase || !member) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: member.email || "",
        options: {
          emailRedirectTo: `${window.location.origin}/member/verify-email`,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to resend verification email",
      };
    }
  };

  const refreshMember = async () => {
    await refreshMemberData();
  };

  const value: MemberContextType = {
    member,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshMember,
    resetPassword,
    verifyEmail,
    uploadAvatar,
    resendVerificationEmail,
  };

  return (
    <MemberContext.Provider value={value}>{children}</MemberContext.Provider>
  );
};

export const useMember = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error("useMember must be used within a MemberProvider");
  }
  return context;
};

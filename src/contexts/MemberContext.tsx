import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { MemberService } from '../services/member.service';
import type { MemberProfile, ApiResponse } from '../types';
import { getAuthStateFast, clearAuthFast } from '../utils/fast-auth';

interface MemberContextType {
  member: MemberProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<ApiResponse>;
  signUp: (signupData: any) => Promise<ApiResponse>;
  signOut: () => Promise<ApiResponse>;
  updateProfile: (profileData: Partial<MemberProfile>) => Promise<ApiResponse>;
  refreshMember: () => Promise<void>;
  resetPassword: (email: string) => Promise<ApiResponse>;
  updatePassword: (newPassword: string) => Promise<ApiResponse>;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadMemberProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setMember(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await loadMemberProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      // Use fast auth check instead of slow getSession()
      const authState = getAuthStateFast();
      if (authState.user && !authState.isExpired) {
        await loadMemberProfile(authState.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Only load profile for members (not admins or providers)
      if (user?.user_metadata?.role === 'member' || !user?.user_metadata?.role) {
        const result = await MemberService.getMemberProfile(userId);
        if (result.success && result.data) {
          setMember(result.data);
        } else {
          // If profile doesn't exist, create it from auth user data
          if (user) {
            const profileData = {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.user_metadata?.full_name,
              phone: user.user_metadata?.phone,
              date_of_birth: user.user_metadata?.date_of_birth,
              gender: user.user_metadata?.gender,
              membership_type: 'basic' as const,
              member_since: user.created_at,
              total_visits: 0
            };

            const createResult = await MemberService.createMemberProfile(profileData);
            if (createResult.success) {
              setMember(createResult.data!);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
    }
  };

  const signIn = async (email: string, password: string, rememberMe?: boolean): Promise<ApiResponse> => {
    try {
      setLoading(true);
      const result = await MemberService.signIn({ email, password, rememberMe });

      if (result.success && result.data?.user) {
        await loadMemberProfile(result.data.user.id);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (signupData: any): Promise<ApiResponse> => {
    try {
      setLoading(true);
      const result = await MemberService.signUp(signupData);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<ApiResponse> => {
    try {
      setLoading(true);
      const result = await MemberService.signOut();
      if (result.success) {
        // Clear fast auth cache
        clearAuthFast();
        setMember(null);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<MemberProfile>): Promise<ApiResponse> => {
    try {
      if (!member) {
        throw new Error('No member logged in');
      }

      const result = await MemberService.updateMemberProfile(member.id, profileData);

      if (result.success && result.data) {
        setMember(result.data);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const refreshMember = async (): Promise<void> => {
    try {
      if (member) {
        await loadMemberProfile(member.id);
      }
    } catch (error) {
      console.error('Error refreshing member:', error);
    }
  };

  const resetPassword = async (email: string): Promise<ApiResponse> => {
    try {
      return await MemberService.resetPassword(email);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const updatePassword = async (newPassword: string): Promise<ApiResponse> => {
    try {
      return await MemberService.updatePassword(newPassword);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
    updatePassword
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
};

export const useMember = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
};

export default MemberContext;
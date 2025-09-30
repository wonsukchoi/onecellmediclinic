import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DatabaseService, AdminService } from "../services/supabase";
import type { AdminContextType, AdminStats } from "../types/admin";
import type { UserProfile } from "../types";
import {
  isAdminFast,
  getAuthStateFast,
  clearAuthFast,
} from "../utils/fast-auth";
import { useAuthState } from "./AuthStateContext";

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  // Initialize with fast auth check to avoid loading delays
  const initialAuthState = getAuthStateFast();
  const initialIsAdmin =
    initialAuthState.user && !initialAuthState.isExpired && isAdminFast();

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(initialIsAdmin)
  );
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (initialIsAdmin && initialAuthState.user) {
      return {
        id: initialAuthState.user.id,
        email: initialAuthState.user.email || "",
        full_name: (initialAuthState.user.user_metadata?.name ||
          initialAuthState.user.user_metadata?.full_name) as string | undefined,
        phone: initialAuthState.user.user_metadata?.phone as string | undefined,
        role: "admin",
        created_at: initialAuthState.user.created_at as string | undefined,
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!initialIsAdmin); // Start with false if already authenticated
  const [stats, setStats] = useState<AdminStats | null>(null);
  const authState = useAuthState();

  const checkAuthStatus = async () => {
    try {
      // Fast auth check - synchronous, no loading state needed
      const authState = getAuthStateFast();

      if (authState.user && !authState.isExpired && isAdminFast()) {
        // Fast path for valid admin tokens
        const userData: UserProfile = {
          id: authState.user.id,
          email: authState.user.email || "",
          full_name: (authState.user.user_metadata?.name ||
            authState.user.user_metadata?.full_name) as string | undefined,
          phone: authState.user.user_metadata?.phone as string | undefined,
          role: "admin",
          created_at: authState.user.created_at as string | undefined,
        };

        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);

        // Load stats in the background, don't wait for it
        loadStats().catch((error) => {
          console.error("Error loading initial stats:", error);
          // Continue even if stats fail to load
        });
      } else {
        // No valid admin session found, clear state
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await AdminService.getAdminStats();
      if (result.success && result.data) {
        setStats(result.data as unknown as AdminStats);
      }
    } catch (error) {
      console.error("Error loading admin stats:", error);
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const result = await DatabaseService.signIn(email, password);

      console.log("result", result);
      if (result.success && result.data) {
        // The result.data contains the auth response with session and user
        const authData = result.data as any;
        const user = authData.user || authData.session?.user;

        if (user) {
          // Check if signed in user is admin
          const isAdmin =
            user.email === "admin@onecellclinic.com" ||
            user.user_metadata?.role === "admin" ||
            user.email?.includes("admin");

          if (isAdmin) {
            // Transform auth user to UserProfile
            const userData: UserProfile = {
              id: user.id,
              email: user.email || "",
              full_name: (user.user_metadata?.name ||
                user.user_metadata?.full_name) as string | undefined,
              phone: user.user_metadata?.phone as string | undefined,
              role: "admin",
              created_at: user.created_at as string | undefined,
            };

            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false); // Clear loading immediately after successful login

            // Load stats in the background, don't wait for it
            loadStats().catch((error) => {
              console.error("Error loading stats after login:", error);
            });
            return { success: true };
          } else {
            setLoading(false); // Clear loading before sign out
            await DatabaseService.signOut();
            return {
              success: false,
              error: "Unauthorized: Admin access required",
            };
          }
        }
      }
      setLoading(false); // Clear loading for failed login
      return {
        success: false,
        error: "Invalid credentials",
      };
    } catch (error) {
      console.error("Error signing in:", error);
      setLoading(false); // Clear loading on error
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await DatabaseService.signOut();
      // Clear fast auth cache
      clearAuthFast();
      setUser(null);
      setIsAuthenticated(false);
      setStats(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async (): Promise<void> => {
    if (isAuthenticated) {
      await loadStats();
    }
  };

  useEffect(() => {
    // Subscribe to unified auth state changes
    const unsubscribe = authState.onAuthEvent((event, session, user) => {
      if (event === "SIGNED_IN" && session && user) {
        // Check if signed in user is admin
        const isAdmin =
          user.email === "admin@onecellclinic.com" ||
          user.user_metadata?.role === "admin" ||
          user.email?.includes("admin");

        if (isAdmin) {
          // Transform auth user to UserProfile
          const userData: UserProfile = {
            id: user.id,
            email: user.email || "",
            full_name: (user.user_metadata?.name ||
              user.user_metadata?.full_name) as string | undefined,
            phone: user.user_metadata?.phone as string | undefined,
            role: "admin",
            created_at: user.created_at as string | undefined,
          };
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);

          // Load stats in the background
          loadStats().catch((error) => {
            console.error("Error loading stats after sign in:", error);
          });
        } else {
          // Not an admin - clear state
          setUser(null);
          setIsAuthenticated(false);
          setStats(null);
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAuthenticated(false);
        setStats(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session && user) {
        // Session refreshed - ensure we're still an admin
        const isAdmin =
          user.email === "admin@onecellclinic.com" ||
          user.user_metadata?.role === "admin" ||
          user.email?.includes("admin");

        if (isAdmin) {
          setLoading(false);
        } else {
          // Lost admin privileges - sign out
          setUser(null);
          setIsAuthenticated(false);
          setStats(null);
          setLoading(false);
        }
      }
    });

    // Initialize with current auth state if available
    if (authState.isInitialized) {
      if (authState.session?.user) {
        const user = authState.session.user;
        const isAdmin =
          user.email === "admin@onecellclinic.com" ||
          user.user_metadata?.role === "admin" ||
          user.email?.includes("admin");

        if (isAdmin) {
          const userData: UserProfile = {
            id: user.id,
            email: user.email || "",
            full_name: (user.user_metadata?.name ||
              user.user_metadata?.full_name) as string | undefined,
            phone: user.user_metadata?.phone as string | undefined,
            role: "admin",
            created_at: user.created_at as string | undefined,
          };
          setUser(userData);
          setIsAuthenticated(true);

          // Load stats in the background
          loadStats().catch((error) => {
            console.error("Error loading initial stats:", error);
          });
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setStats(null);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setStats(null);
      }
      setLoading(false);
    } else {
      // Fallback to fast auth check if unified auth not ready
      const currentAuthState = getAuthStateFast();
      const hasValidAuth =
        currentAuthState.user && !currentAuthState.isExpired && isAdminFast();

      if (!hasValidAuth) {
        checkAuthStatus();
      } else {
        // Already authenticated - load stats in background
        loadStats().catch((error) => {
          console.error("Error loading initial stats:", error);
        });
      }
    }

    return unsubscribe;
  }, [authState]);

  const value: AdminContextType = {
    isAuthenticated,
    user,
    loading,
    stats,
    signIn,
    signOut,
    refreshStats,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export default AdminContext;

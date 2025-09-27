import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  DatabaseService,
  onAuthStateChange,
} from "../services/supabase";
import type { AuthContextType, UserProfile, ApiResponse } from "../types";
import { AuthContext } from "./AuthContextDefinition";
import { logAuthDebugInfo } from "../utils/auth-debug";
import { ErrorLogger } from "../utils/error-logger";
import { useApiCall } from "../hooks/useApiCall";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Refs for cleanup and preventing race conditions
  const mountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  // API calls with retry logic
  const getCurrentUserApi = useApiCall(
    async () => {
      // Wait for Supabase client initialization
      await new Promise((resolve) => setTimeout(resolve, 100));
      return DatabaseService.getCurrentUser();
    },
    {
      retryCount: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      onError: (error, attempt) => {
        ErrorLogger.logError(error, {
          context: "AuthProvider.getCurrentUser",
          attempt,
          initialized,
        });
      },
      onRetry: (attempt, delay) => {
        console.log(`Retrying user fetch in ${delay}ms (attempt ${attempt})`);
      },
    }
  );

  const signInApi = useApiCall(
    async ({ email, password }: { email: string; password: string }) => {
      return DatabaseService.signIn(email, password);
    },
    {
      retryCount: 1, // Don't retry sign-in multiple times
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: "AuthProvider.signIn",
        });
      },
    }
  );

  const signUpApi = useApiCall(
    async ({
      email,
      password,
      userData,
    }: {
      email: string;
      password: string;
      userData?: Partial<UserProfile>;
    }) => {
      return DatabaseService.signUp(email, password, userData);
    },
    {
      retryCount: 1,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: "AuthProvider.signUp",
        });
      },
    }
  );

  const signOutApi = useApiCall(
    async () => {
      return DatabaseService.signOut();
    },
    {
      retryCount: 2,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: "AuthProvider.signOut",
        });
      },
    }
  );

  // Get initial user state with better error handling
  const getInitialUser = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      const result = await getCurrentUserApi.execute();

      if (mountedRef.current && result) {
        if (result.success) {
          setUser(result.data || null);
          if (process.env.NODE_ENV === "development") {
            await logAuthDebugInfo("Initial Load");
          }
        } else {
          console.warn("Failed to get initial user:", result.error);
          setUser(null);
        }
      }
    } catch (error) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          context: "AuthProvider.getInitialUser",
        }
      );
      if (mountedRef.current) {
        setUser(null);
      }
    } finally {
      if (mountedRef.current) {
        setInitialized(true);
        setLoading(false);
      }
    }
  }, []); // Remove getCurrentUserApi dependency to prevent infinite loop

  // Handle auth state changes with error boundaries
  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      if (!mountedRef.current) return;

      console.log(
        "Auth state change:",
        event,
        session ? "session exists" : "no session"
      );

      console.log("session", session);

      if (session) {
        setUser(session.user);
        return;
      }

      try {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const result = await getCurrentUserApi.execute();
          console.log("result", result);
          if (mountedRef.current && result) {
            if (result.success) {
              setUser(result.data || null);
            } else {
              console.warn(
                "Failed to get user after auth state change:",
                result.error
              );
              setUser(null);
            }
          }
        } else if (event === "SIGNED_OUT") {
          if (mountedRef.current) {
            setUser(null);
          }
        }
      } catch (error) {
        ErrorLogger.logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            context: "AuthProvider.handleAuthStateChange",
            event,
            hasSession: !!session,
          }
        );
        if (mountedRef.current) {
          setUser(null);
        }
      } finally {
        if (mountedRef.current && initialized) {
          setLoading(false);
        }
      }
    },
    [initialized]
  ); // Remove getCurrentUserApi dependency to prevent infinite loop

  // Setup auth subscription with cleanup
  useEffect(() => {
    mountedRef.current = true;

    // Initialize user state
    getInitialUser();

    // Setup auth state listener
    try {
      const {
        data: { subscription },
      } = onAuthStateChange(handleAuthStateChange);
      subscriptionRef.current = subscription;
    } catch (error) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          context: "AuthProvider.setupSubscription",
        }
      );
    }

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [getInitialUser, handleAuthStateChange]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    if (!mountedRef.current) {
      return { success: false, error: "Component unmounted" };
    }

    try {
      setLoading(true);
      const result = await signInApi.execute({ email, password });

      if (mountedRef.current && result && result.success) {
        // Give some time for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (mountedRef.current) {
          const userResult = await getCurrentUserApi.execute();
          if (userResult && userResult.success) {
            setUser(userResult.data || null);
            if (process.env.NODE_ENV === "development") {
              await logAuthDebugInfo("Sign In Success");
            }
          } else {
            console.warn(
              "Sign in succeeded but failed to get user:",
              userResult?.error
            );
          }
        }
      }

      return result || { success: false, error: "Sign in failed" };
    } catch (error) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          context: "AuthProvider.signIn",
          email,
        }
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: Partial<UserProfile>
  ): Promise<ApiResponse> => {
    if (!mountedRef.current) {
      return { success: false, error: "Component unmounted" };
    }

    try {
      setLoading(true);
      const result = await signUpApi.execute({ email, password, userData });

      // Note: User will be set via auth state change listener
      // after email confirmation

      return result || { success: false, error: "Sign up failed" };
    } catch (error) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          context: "AuthProvider.signUp",
          email,
        }
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signOut = async (): Promise<ApiResponse> => {
    if (!mountedRef.current) {
      return { success: false, error: "Component unmounted" };
    }

    try {
      setLoading(true);
      const result = await signOutApi.execute();

      if (mountedRef.current && result && result.success) {
        setUser(null);
      }

      return result || { success: false, error: "Sign out failed" };
    } catch (error) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          context: "AuthProvider.signOut",
        }
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const updateProfile = async (
    userData: Partial<UserProfile>
  ): Promise<ApiResponse> => {
    // This would require additional Supabase setup for user profile updates
    // For now, return a placeholder implementation
    console.log("Profile update requested:", userData);
    return { success: false, error: "Profile updates not implemented yet" };
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

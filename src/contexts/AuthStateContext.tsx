import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useSupabase } from "./SupabaseContext";
import { clearAuthCache } from "../utils/fast-auth";

interface AuthStateContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  onAuthEvent: (callback: AuthEventCallback) => () => void;
}

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

interface AuthEventCallback {
  (event: AuthEvent, session: Session | null, user: User | null): void;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);

interface AuthStateProviderProps {
  children: ReactNode;
}

export const AuthStateProvider: React.FC<AuthStateProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const eventCallbacksRef = useRef<AuthEventCallback[]>([]);

  const { client: supabase } = useSupabase();

  // Notify all registered callbacks about auth events
  const notifyCallbacks = useCallback((event: AuthEvent, session: Session | null, user: User | null) => {
    // Use ref to access current callbacks without creating dependency
    eventCallbacksRef.current.forEach(callback => {
      try {
        callback(event, session, user);
      } catch (error) {
        console.error('Error in auth event callback:', error);
      }
    });
  }, []); // No dependencies to prevent infinite loop

  // Register event callback and return unsubscribe function
  const onAuthEvent = useCallback((callback: AuthEventCallback) => {
    eventCallbacksRef.current = [...eventCallbacksRef.current, callback];

    return () => {
      eventCallbacksRef.current = eventCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
        }

        setSession(initialSession);
        setUser(initialSession?.user || null);
        setLoading(false);
        setIsInitialized(true);

        // Notify callbacks about initial state
        if (initialSession?.user) {
          notifyCallbacks('SIGNED_IN', initialSession, initialSession.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    void initializeAuth();

    // Set up auth state change listener - SINGLE LISTENER FOR ENTIRE APP
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update core auth state
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      // Clear auth cache on state changes
      if (event === 'SIGNED_OUT') {
        clearAuthCache();
      }

      // Notify all registered callbacks
      const authEvent = event as AuthEvent;
      notifyCallbacks(authEvent, session, session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, notifyCallbacks]);

  const value: AuthStateContextType = {
    session,
    user,
    loading,
    isInitialized,
    onAuthEvent,
  };

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthState = (): AuthStateContextType => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("useAuthState must be used within an AuthStateProvider");
  }
  return context;
};

export default AuthStateContext;
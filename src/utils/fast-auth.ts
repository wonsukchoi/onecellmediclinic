/**
 * Fast Authentication Utilities
 *
 * This module provides fast access to Supabase authentication tokens
 * by reading directly from localStorage instead of using slow async calls
 * to supabase.auth.getSession(). Includes cached getSession for performance.
 */

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
  refresh_token: string;
  user: User;
}

type SupabaseAuthToken = Session;

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isExpired: boolean;
}

interface CachedSession {
  session: Session | null;
  timestamp: number;
}

// Centralized Supabase configuration
export const SUPABASE_CONFIG = {
  url: "https://weqqkknwpgremfugcbvz.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg",
} as const;

// Session cache with 5-minute TTL
let sessionCache: CachedSession | null = null;
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get the localStorage key for Supabase auth tokens
 * Format: sb-<project-ref>-auth-token
 */
function getSupabaseAuthKey(): string {
  // Extract project ref from the centralized Supabase URL
  return "onecell-clinic-auth-token";
}

/**
 * Fast access to authentication token from localStorage
 * Returns null if no valid token exists or token is expired
 */
export function getAccessTokenFast(): string | null {
  try {
    if (typeof window === "undefined") {
      return null; // Server-side
    }

    const authKey = getSupabaseAuthKey();
    const authData = localStorage.getItem(authKey);

    if (!authData) {
      return null;
    }

    const parsed: SupabaseAuthToken = JSON.parse(authData);

    if (!parsed.access_token) {
      return null;
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (parsed.expires_at && parsed.expires_at < now) {
      return null; // Token expired
    }

    return parsed.access_token;
  } catch {
    // Silent fail - return null if can't read token
    return null;
  }
}

/**
 * Get complete auth state from localStorage
 * Includes access token, user data, and expiration status
 */
export function getAuthStateFast(): AuthState {
  try {
    if (typeof window === "undefined") {
      return { accessToken: null, user: null, isExpired: true };
    }

    const authKey = getSupabaseAuthKey();
    const authData = localStorage.getItem(authKey);

    if (!authData) {
      return { accessToken: null, user: null, isExpired: true };
    }

    const parsed: SupabaseAuthToken = JSON.parse(authData);

    if (!parsed.access_token) {
      return { accessToken: null, user: null, isExpired: true };
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const isExpired = parsed.expires_at ? parsed.expires_at < now : true;

    return {
      accessToken: isExpired ? null : parsed.access_token,
      user: isExpired ? null : parsed.user,
      isExpired,
    };
  } catch {
    // Silent fail - return empty state if can't read
    return { accessToken: null, user: null, isExpired: true };
  }
}

/**
 * Check if user is authenticated (has valid, non-expired token)
 */
export function isAuthenticatedFast(): boolean {
  const authState = getAuthStateFast();
  return authState.accessToken !== null && !authState.isExpired;
}

/**
 * Get user data from localStorage without async calls
 */
export function getUserFast(): User | null {
  const authState = getAuthStateFast();
  return authState.user;
}

/**
 * Fast check if current user is admin
 * Reads from localStorage auth data
 */
export function isAdminFast(): boolean {
  const user = getUserFast();
  console.log("user", user);
  if (!user) return false;

  return (
    user.email === "admin@onecellclinic.com" ||
    user.user_metadata?.role === "admin" ||
    (user.email?.includes("admin") ?? false)
  );
}

/**
 * Get authentication headers for API calls using fast localStorage access
 * Fallback to anonymous key if no valid token
 */
export function getAuthHeadersFast(): { [key: string]: string } {
  const accessToken = getAccessTokenFast();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken || SUPABASE_CONFIG.anonKey}`,
  };
}

/**
 * Cached getSession implementation for performance optimization
 * Only calls the actual getSession once every 5 minutes
 * Note: Using 'any' type for supabaseClient to maintain compatibility with various Supabase client versions
 */

export async function getSessionCached(
  supabaseClient: any
): Promise<{ data: { session: any }; error: any }> {
  try {
    // Check if we have a valid cached session
    if (
      sessionCache &&
      Date.now() - sessionCache.timestamp < SESSION_CACHE_TTL
    ) {
      return { data: { session: sessionCache.session }, error: null };
    }

    // Fast check from localStorage first
    const authState = getAuthStateFast();
    if (!authState.accessToken || authState.isExpired) {
      // Clear cache and return null session
      sessionCache = null;
      return { data: { session: null }, error: null };
    }

    // Only call getSession if localStorage indicates we should have a session
    const { data, error } = await supabaseClient.auth.getSession();

    if (!error && data.session) {
      // Cache the session
      sessionCache = {
        session: data.session,
        timestamp: Date.now(),
      };
    } else {
      // Clear cache on error or no session
      sessionCache = null;
    }

    return { data, error };
  } catch (error) {
    // Clear cache on any error
    sessionCache = null;
    return { data: { session: null }, error: error as Error };
  }
}

/**
 * Clear the session cache
 * Should be called when user logs out or auth state changes
 */
export function clearSessionCache(): void {
  sessionCache = null;
}

/**
 * Get Edge Functions URL for the current Supabase project
 */
export function getFunctionsUrl(): string {
  return `${SUPABASE_CONFIG.url}/functions/v1`;
}

/**
 * Clear authentication data from localStorage and session cache
 * Use this when user explicitly logs out
 */
export function clearAuthFast(): void {
  try {
    if (typeof window !== "undefined") {
      const authKey = getSupabaseAuthKey();
      localStorage.removeItem(authKey);
    }
    // Also clear the session cache
    clearSessionCache();
  } catch {
    // Silent fail - best effort to clear auth
  }
}

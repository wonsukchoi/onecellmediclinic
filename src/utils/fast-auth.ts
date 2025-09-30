/**
 * Fast Authentication Utilities
 *
 * This module provides fast access to Supabase authentication tokens
 * by reading directly from localStorage instead of using slow async calls
 * to supabase.auth.getSession(). Includes cached getSession for performance.
 */

import { STORAGE_KEY } from "../services/supabase";
import type { SupabaseClient, Session as SupabaseSession, AuthError } from "@supabase/supabase-js";

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
  session: SupabaseSession | null;
  timestamp: number;
}

interface CachedUser {
  user: User | null;
  timestamp: number;
}

interface CachedAuthHeaders {
  headers: { [key: string]: string };
  timestamp: number;
}

// Centralized Supabase configuration
export const SUPABASE_CONFIG = {
  url: "https://weqqkknwpgremfugcbvz.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg",
} as const;

// Cache with 5-minute TTL
let sessionCache: CachedSession | null = null;
let userCache: CachedUser | null = null;
let authHeadersCache: CachedAuthHeaders | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get the localStorage key for Supabase auth tokens
 * Format: sb-<project-ref>-auth-token
 */
export function getSupabaseAuthKey(): string {
  // Extract project ref from the centralized Supabase URL
  return STORAGE_KEY;
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
  if (!user) return false;

  return (
    user.email === "admin@onecellclinic.com" ||
    user.user_metadata?.role === "admin" ||
    (user.email?.includes("admin") ?? false)
  );
}

/**
 * Get authentication headers for API calls with caching
 * Fallback to anonymous key if no valid token
 */
export function getAuthHeaders(): { [key: string]: string } {
  if (
    authHeadersCache &&
    Date.now() - authHeadersCache.timestamp < CACHE_TTL
  ) {
    return authHeadersCache.headers;
  }

  const accessToken = getAccessTokenFast();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken || SUPABASE_CONFIG.anonKey}`,
  };

  authHeadersCache = {
    headers,
    timestamp: Date.now(),
  };

  return headers;
}

/**
 * Cached getSession implementation for performance optimization
 * Only calls the actual getSession once every 5 minutes
 */
export async function getSessionCached(
  supabaseClient: SupabaseClient
): Promise<{ data: { session: SupabaseSession | null }; error: AuthError | null }> {
  try {
    // Check if we have a valid cached session
    if (
      sessionCache &&
      Date.now() - sessionCache.timestamp < CACHE_TTL
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
  } catch {
    // Clear cache on any error
    sessionCache = null;
    return { data: { session: null }, error: null };
  }
}

/**
 * Cached getUser implementation for performance optimization
 * Only calls the actual getUser once every 5 minutes
 */
export async function getUserCached(
  supabaseClient: SupabaseClient
): Promise<{ data: { user: User | null }; error: AuthError | null }> {
  try {
    // Check if we have a valid cached user
    if (
      userCache &&
      Date.now() - userCache.timestamp < CACHE_TTL
    ) {
      return { data: { user: userCache.user }, error: null };
    }

    // Fast check from localStorage first
    const authState = getAuthStateFast();
    if (!authState.accessToken || authState.isExpired) {
      // Clear cache and return null user
      userCache = null;
      return { data: { user: null }, error: null };
    }

    // Only call getUser if localStorage indicates we should have a user
    const { data, error } = await supabaseClient.auth.getUser();

    if (!error && data.user) {
      // Cache the user
      userCache = {
        user: data.user as unknown as User,
        timestamp: Date.now(),
      };
    } else {
      // Clear cache on error or no user
      userCache = null;
    }

    return { data: { user: data.user as User | null }, error };
  } catch {
    // Clear cache on any error
    userCache = null;
    return { data: { user: null }, error: null };
  }
}

/**
 * Clear all auth caches
 * Should be called when user logs out or auth state changes
 */
export function clearAuthCache(): void {
  sessionCache = null;
  userCache = null;
  authHeadersCache = null;
}

/**
 * Clear the session cache
 * Should be called when user logs out or auth state changes
 * @deprecated Use clearAuthCache instead
 */
export function clearSessionCache(): void {
  clearAuthCache();
}

/**
 * Get Edge Functions URL for the current Supabase project
 */
export function getFunctionsUrl(): string {
  return `${SUPABASE_CONFIG.url}/functions/v1`;
}

/**
 * Clear authentication data from localStorage and all caches
 * Use this when user explicitly logs out
 */
export function clearAuthFast(): void {
  try {
    if (typeof window !== "undefined") {
      const authKey = getSupabaseAuthKey();
      localStorage.removeItem(authKey);
    }
    // Also clear all auth caches
    clearAuthCache();
  } catch {
    // Silent fail - best effort to clear auth
  }
}

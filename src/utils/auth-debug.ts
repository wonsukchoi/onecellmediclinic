/**
 * Authentication Debugging Utilities
 *
 * These utilities help diagnose auth session issues in development
 */

import { supabase } from '../services/supabase'

export interface AuthDebugInfo {
  hasSession: boolean
  sessionExpiry: string | null
  userEmail: string | null
  userId: string | null
  userRole: string | null
  storageKeys: string[]
  lastRefresh: string | null
}

export const getAuthDebugInfo = async (): Promise<AuthDebugInfo> => {
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all localStorage keys related to auth
  const storageKeys = typeof window !== 'undefined'
    ? Object.keys(localStorage).filter(key =>
        key.includes('supabase') ||
        key.includes('auth') ||
        key.includes('onecell')
      )
    : []

  return {
    hasSession: !!session,
    sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    userEmail: user?.email || null,
    userId: user?.id || null,
    userRole: user?.user_metadata?.role || 'user',
    storageKeys,
    lastRefresh: session?.refresh_token ? 'Available' : null
  }
}

export const logAuthDebugInfo = async (context = 'Debug') => {
  const info = await getAuthDebugInfo()
  console.group(`🔐 Auth Debug [${context}]`)
  console.log('Session exists:', info.hasSession)
  console.log('User email:', info.userEmail)
  console.log('User ID:', info.userId)
  console.log('User role:', info.userRole)
  console.log('Session expiry:', info.sessionExpiry)
  console.log('Storage keys:', info.storageKeys)
  console.log('Refresh token:', info.lastRefresh)
  console.groupEnd()
  return info
}

export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    const authKeys = Object.keys(localStorage).filter(key =>
      key.includes('supabase') ||
      key.includes('auth') ||
      key.includes('onecell')
    )
    authKeys.forEach(key => localStorage.removeItem(key))
    console.log('🧹 Cleared auth storage keys:', authKeys)
  }
}

// Auto-log auth debug info when this module is imported in development
if (process.env.NODE_ENV === 'development') {
  // Add global debug function
  if (typeof window !== 'undefined') {
    (window as any).authDebug = logAuthDebugInfo;
    (window as any).clearAuth = clearAuthStorage;
    console.log('🛠️ Auth debug functions available: authDebug(), clearAuth()')
  }
}
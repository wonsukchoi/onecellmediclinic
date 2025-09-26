import React, { useEffect, useState } from 'react'
import { DatabaseService, onAuthStateChange } from '../services/supabase'
import type { AuthContextType, UserProfile, ApiResponse } from '../types'
import { AuthContext } from './AuthContextDefinition'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user state
    const getInitialUser = async () => {
      const { data } = await DatabaseService.getCurrentUser()
      setUser(data || null)
      setLoading(false)
    }

    getInitialUser()

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { data } = await DatabaseService.getCurrentUser()
        setUser(data || null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<ApiResponse> => {
    setLoading(true)
    const result = await DatabaseService.signIn(email, password)

    if (result.success) {
      const { data } = await DatabaseService.getCurrentUser()
      setUser(data || null)
    }

    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>): Promise<ApiResponse> => {
    setLoading(true)
    const result = await DatabaseService.signUp(email, password, userData)

    // Note: User will be set via auth state change listener
    // after email confirmation

    setLoading(false)
    return result
  }

  const signOut = async (): Promise<ApiResponse> => {
    setLoading(true)
    const result = await DatabaseService.signOut()

    if (result.success) {
      setUser(null)
    }

    setLoading(false)
    return result
  }

  const updateProfile = async (userData: Partial<UserProfile>): Promise<ApiResponse> => {
    // This would require additional Supabase setup for user profile updates
    // For now, return a placeholder implementation
    console.log('Profile update requested:', userData)
    return { success: false, error: 'Profile updates not implemented yet' }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
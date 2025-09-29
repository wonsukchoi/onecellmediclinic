import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DatabaseService, AdminService, supabase } from '../services/supabase';
import type { AdminContextType, AdminStats } from '../types/admin';
import type { UserProfile } from '../types';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const result = await DatabaseService.getCurrentUser();

      if (result.success && result.data) {
        const userData = result.data;
        // Check if user has admin role
        if (userData.role === 'admin' || userData.email?.includes('admin')) {
          setUser(userData);
          setIsAuthenticated(true);
          // Load stats in the background, don't wait for it
          loadStats().catch(error => {
            console.error('Error loading initial stats:', error);
            // Continue even if stats fail to load
          });
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await AdminService.getAdminStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const result = await DatabaseService.signIn(email, password);

      if (result.success) {
        // Check if signed in user is admin
        const userResult = await DatabaseService.getCurrentUser();
        if (userResult.success && userResult.data) {
          const userData = userResult.data;
          if (userData.role === 'admin' || userData.email?.includes('admin')) {
            setUser(userData);
            setIsAuthenticated(true);
            // Load stats in the background, don't wait for it
            loadStats().catch(error => {
              console.error('Error loading stats after login:', error);
            });
            return { success: true };
          } else {
            await DatabaseService.signOut();
            return { success: false, error: 'Unauthorized: Admin access required' };
          }
        }
        return { success: false, error: 'Failed to verify user credentials' };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await DatabaseService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setStats(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
    // Check initial auth status
    checkAuthStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in - verify admin role
          const result = await DatabaseService.getCurrentUser();
          if (result.success && result.data) {
            const userData = result.data;
            if (userData.role === 'admin' || userData.email?.includes('admin')) {
              setUser(userData);
              setIsAuthenticated(true);
              setLoading(false);
              // Load stats in background
              loadStats().catch(error => {
                console.error('Error loading stats on auth change:', error);
              });
            } else {
              setUser(null);
              setIsAuthenticated(false);
              setLoading(false);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setStats(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Session refreshed - just ensure loading is false
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
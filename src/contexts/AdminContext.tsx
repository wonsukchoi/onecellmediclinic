import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { AdminContextType, AdminStats } from "../types";
import { AdminService } from "../services/admin.service";

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  // useEffect(() => {
  //   if (isAdmin) {
  //     refreshStats()
  //   } else {
  //     setLoading(false)
  //   }
  // }, [isAdmin])

  const refreshStats = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const response = await AdminService.getAdminStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const value: AdminContextType = {
    isAdmin,
    loading,
    stats,
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

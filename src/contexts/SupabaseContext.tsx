import React, { createContext, useContext, ReactNode } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "../utils/fast-auth";

export const STORAGE_KEY = "onecell-clinic-user-profile";

interface SupabaseContextType {
  client: SupabaseClient;
  publicClient: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const client = createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: STORAGE_KEY,
        flowType: "pkce",
      },
    }
  );

  const publicClient = createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const value: SupabaseContextType = {
    client,
    publicClient,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

export default SupabaseContext;
"use client";

import { createContext, useContext, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client"; // Your browser-side client
import useSWR from "swr";

// Define the shape of our Auth State
type AuthContextType = {
  user: any;
  profile: any;
  isLoading: boolean;
  error: any;
  mutate: () => void; // Function to manually refresh data
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  // The SWR Fetcher
  const fetchUser = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return null;

    // Fetch the profile we fixed with the RLS policies earlier
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { user, profile };
  };

  // SWR Hook: Keyed by 'auth-user'
  const { data, error, isLoading, mutate } = useSWR("auth-user", fetchUser, {
    revalidateOnFocus: true, // Refetch when user switches tabs back to your app
    shouldRetryOnError: false,
  });

  const value = {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading,
    error,
    mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

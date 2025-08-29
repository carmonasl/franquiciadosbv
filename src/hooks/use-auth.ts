"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Debug info interface
  interface DebugInfo {
    userId?: string;
    profileError?: string;
    profileErrorMessage?: string;
    tablesAccessible?: boolean;
    allProfilesCount?: number;
  }

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({}); // Add debug info

  const fetchProfile = useCallback(async (userId: string) => {
    console.log("🔍 Fetching profile for user:", userId);

    try {
      // First, let's check what tables exist and what the user can access
      const { data: tablesCheck, error: tablesError } = await supabase
        .from("profiles")
        .select("count(*)", { count: "exact", head: true });

      console.log("📊 Profiles table access check:", {
        tablesCheck,
        tablesError,
      });

      // Now try to fetch the specific profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("📦 Profile query result:", {
        userId,
        profileData,
        profileError,
        errorCode: profileError?.code,
        errorMessage: profileError?.message,
      });

      // Let's also try to fetch ALL profiles to see if RLS is the issue
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, email"); // Only select safe fields

      console.log("👥 All profiles query (for debugging):", {
        count: allProfiles?.length,
        allProfilesError,
      });

      setDebugInfo({
        userId,
        profileError: profileError?.code,
        profileErrorMessage: profileError?.message,
        tablesAccessible: !tablesError,
        allProfilesCount: allProfiles?.length || 0,
      });

      if (profileError) {
        console.error("❌ Profile fetch error:", profileError);

        // Check if it's an RLS policy issue
        if (profileError.code === "42501" || profileError.code === "PGRST301") {
          console.error(
            "🚨 This looks like a Row Level Security (RLS) policy issue!"
          );
        }

        // Check if profile doesn't exist
        if (profileError.code === "PGRST116") {
          console.log("ℹ️ Profile not found - might need to be created");
        }

        return null;
      }

      console.log("🟢 Profile fetched successfully:", profileData);
      return profileData;
    } catch (error) {
      console.error("🔥 Exception in fetchProfile:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔍 Initializing auth...");

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("📋 Session details:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          sessionError: sessionError?.message,
        });

        if (sessionError) {
          console.error("❌ Session error:", sessionError);
        }

        if (isMounted) {
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("👤 User found, fetching profile...");
            const profileData = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile(profileData);
              console.log("✅ Profile set in state:", profileData);
            }
          } else {
            console.log("❌ No user in session");
          }
        }
      } catch (err) {
        console.error("❌ Auth initialization error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("🏁 Auth initialization complete");
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", event, {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (!isMounted) return;

      setLoading(true);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        if (isMounted) setProfile(profileData);
      } else {
        setProfile(null);
      }

      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  // Add debug logging whenever profile changes
  useEffect(() => {
    console.log("🔄 Profile state changed:", profile);
  }, [profile]);

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === "admin",
    debugInfo, // Expose debug info for testing
  };
}

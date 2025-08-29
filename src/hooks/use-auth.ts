"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSessionAndProfile = async () => {
      try {
        console.log("🔍 Fetching session...");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error("❌ Session error:", sessionError);
        }

        setUser(session?.user ?? null);
        console.log("🟢 Session user:", session?.user);

        if (session?.user) {
          console.log("🔍 Fetching profile for user:", session.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("❌ Profile fetch error:", profileError);
          } else {
            console.log("🟢 Profile fetched:", profileData);
            if (isMounted) setProfile(profileData);
          }
        }
      } catch (err) {
        console.error("❌ Auth error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error(
            "❌ Profile fetch error on auth state change:",
            profileError
          );
        } else {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === "admin",
  };
}

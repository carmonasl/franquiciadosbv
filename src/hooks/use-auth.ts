"use client";

import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Función para cargar el perfil del usuario
    const loadProfile = async (currentUser: User) => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (isMounted) setProfile(data);
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    };

    // Obtener sesión inicial
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user);
        }
      } catch (err) {
        console.error("Error inicializando auth:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Suscripción a cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        if (!isMounted) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === "admin",
  };
}

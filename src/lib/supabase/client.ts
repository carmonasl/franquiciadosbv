// lib/supabase/client.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

console.log("🔧 Supabase environment check:", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Present" : "❌ Missing",
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing",
});

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing!");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!");
}

// Custom storage implementation to debug what's happening
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      const value = localStorage.getItem(key);
      console.log(
        `📖 Reading from storage: ${key} = ${value ? "FOUND" : "NULL"}`
      );
      return value;
    } catch (error) {
      console.error(`❌ Error reading ${key}:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
      console.log(`📝 Writing to storage: ${key} = SAVED`);
    } catch (error) {
      console.error(`❌ Error saving ${key}:`, error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed from storage: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
    }
  },
};

export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      storageKey: "sb-auth-token", // Use a simpler key
    },
  }
);

console.log("🔧 Supabase client created:", !!supabase);

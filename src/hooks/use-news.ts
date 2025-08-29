"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { NewsItem } from "@/types";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNews = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;

      try {
        setLoading(true);
        setError(null);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("TIMEOUT")), 15000);
        });

        const fetchPromise = supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]);

        if (error) {
          throw error;
        }

        setNews(data || []);
        setLoading(false);
      } catch (err) {
        const error = err as Error;
        console.error(`News fetch error (attempt ${retryCount + 1}):`, error);

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            fetchNews(retryCount + 1);
          }, delay);
        } else {
          if (error.message === "TIMEOUT") {
            setError("Error consiguiendo las noticias");
          } else {
            setError(
              error.message ||
                "Error al cargar noticias después de varios intentos"
            );
          }
          setLoading(false);
        }
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const createNews = async (title: string, content: string) => {
    const { data, error } = await supabase
      .from("news")
      .insert({ title, content })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setNews((prev) => [data, ...prev]);
    return data;
  };

  const updateNews = async (id: number, title: string, content: string) => {
    const { data, error } = await supabase
      .from("news") // ← Faltaba esto
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setNews((prev) => prev.map((item) => (item.id === id ? data : item)));
    return data;
  };

  const deleteNews = async (id: number) => {
    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      throw error;
    }

    setNews((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    news,
    loading,
    error,
    createNews,
    updateNews,
    deleteNews,
    refetch: () => fetchNews(0),
  };
}

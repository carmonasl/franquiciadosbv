"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { NewsItem } from "@/types";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const supabase = createClient();

  const fetchNews = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching news...");
      console.time("fetchNews");

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      console.timeEnd("fetchNews");
      console.log({ data, error });

      if (!isMounted.current) return;

      if (error) throw error;

      setNews(data || []);
    } catch (err) {
      if (!isMounted.current) return;

      const e = err as Error;
      console.error("News fetch error:", e);
      setError(e.message || "Error al cargar noticias");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchNews();

    return () => {
      isMounted.current = false;
    };
  }, [fetchNews]);

  const createNews = async (title: string, content: string) => {
    const { data, error } = await supabase
      .from("news")
      .insert({ title, content })
      .select()
      .single();

    if (error) throw error;

    setNews((prev) => [data, ...prev]);
    return data;
  };

  const updateNews = async (id: number, title: string, content: string) => {
    const { data, error } = await supabase
      .from("news")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    setNews((prev) => prev.map((item) => (item.id === id ? data : item)));
    return data;
  };

  const deleteNews = async (id: number) => {
    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) throw error;

    setNews((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    news,
    loading,
    error,
    createNews,
    updateNews,
    deleteNews,
    refetch: fetchNews,
  };
}

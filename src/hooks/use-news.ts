"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { NewsItem } from "@/types";

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching news:", error);
        setError(error.message);
      } else {
        setNews(data || []);
        setError(null);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Error inesperado al cargar noticias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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
      .from("news")
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
    refetch: fetchNews,
  };
}

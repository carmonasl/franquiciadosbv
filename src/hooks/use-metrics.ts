"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Metric } from "@/types";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("metrics")
        .select("*")
        .order("month", { ascending: false });

      if (error) {
        console.error("Error fetching metrics:", error);
        setError(error.message);
      } else {
        setMetrics(data || []);
        setError(null);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Error inesperado al cargar métricas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

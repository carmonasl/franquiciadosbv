"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Metric } from "@/types";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchMetrics = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;

      try {
        setLoading(true);
        setError(null);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("TIMEOUT")), 15000);
        });

        const fetchPromise = supabase
          .from("metrics")
          .select("*")
          .order("month", { ascending: false });

        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]);

        if (error) {
          throw error;
        }

        setMetrics(data || []);
        setLoading(false);
      } catch (err) {
        const error = err as Error;
        console.error(
          `Metrics fetch error (attempt ${retryCount + 1}):`,
          error
        );

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            fetchMetrics(retryCount + 1);
          }, delay);
        } else {
          if (error.message === "TIMEOUT") {
            setError("Error consiguiendo las métricas");
          } else {
            setError(
              error.message ||
                "Error al cargar métricas después de varios intentos"
            );
          }
          setLoading(false);
        }
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: () => fetchMetrics(0),
  };
}

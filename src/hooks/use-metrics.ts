"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Metric } from "@/types";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const fetchMetrics = useCallback(
    async (attempt = 0) => {
      const maxRetries = 3;
      setLoading(true);
      setError(null);

      // Cancelamos cualquier petición anterior
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Timeout real con AbortController
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s

        const { data, error } = await supabase
          .from("metrics")
          .select("*")
          .order("month", { ascending: false })
          .abortSignal(controller.signal);

        clearTimeout(timeout);

        if (!isMounted.current) return;

        if (error) throw error;

        setMetrics(data || []);
        setError(null);
      } catch (err) {
        if (!isMounted.current) return;

        const e = err as Error;
        console.error(`Metrics fetch error (attempt ${attempt + 1}):`, e);

        if (attempt < maxRetries && e.name !== "AbortError") {
          const delay = Math.pow(2, attempt) * 1000;
          setTimeout(() => fetchMetrics(attempt + 1), delay);
        } else {
          if (e.name === "AbortError") {
            setError("La petición de métricas se canceló por timeout.");
          } else if (e.message === "TIMEOUT") {
            setError("Error consiguiendo las métricas");
          } else {
            setError(
              e.message || "Error al cargar métricas después de varios intentos"
            );
          }
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    isMounted.current = true;
    fetchMetrics();

    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: () => fetchMetrics(0),
  };
}

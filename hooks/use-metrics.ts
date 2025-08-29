"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Metric } from "@/types";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  const fetchMetrics = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching metrics...");
      const supabase = createClient();

      const { data, error } = await supabase
        .from("metrics")
        .select("*")
        .order("month", { ascending: false });

      console.log("Raw metrics data:", data, "Error:", error);

      if (!isMounted.current) return;

      if (error) throw error;

      // Mapeo seguro para evitar null
      const safeData = (data || []).map((m) => ({
        id: m.id,
        month: m.month ?? "",
        revenue: m.revenue ?? 0,
        customers: m.customers ?? 0,
        orders: m.orders ?? 0,
        franchise_id: m.franchise_id ?? "",
        created_at: m.created_at ?? new Date().toISOString(),
      }));
      setMetrics(safeData);
    } catch (err) {
      if (!isMounted.current) return;

      const e = err as Error;
      console.error("Metrics fetch error:", e);
      setError(e.message || "Error al cargar métricas");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchMetrics();

    return () => {
      isMounted.current = false;
    };
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

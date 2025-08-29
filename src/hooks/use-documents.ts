"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MyDocument } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Cancelamos cualquier fetch previo
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Timeout de 8s usando AbortController
      const timeout = setTimeout(() => controller.abort(), 8000);

      const { data, error } = await supabase
        .from("documents")
        .select("id, name, file_path, file_size, mime_type, created_at") // solo los campos necesarios
        .order("created_at", { ascending: false })
        // @ts-ignore supabase internal abortSignal
        .abortSignal(controller.signal);

      clearTimeout(timeout);

      if (!isMounted.current) return;

      if (error) throw error;

      setDocuments(data || []);
    } catch (err) {
      if (!isMounted.current) return;
      const e = err as Error;

      if (e.name === "AbortError") {
        setError("La petición de documentos se canceló por timeout.");
      } else {
        setError("Error cargando documentos. Intenta recargar.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    isMounted.current = true;
    fetchDocuments();

    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchDocuments]);

  const uploadDocument = async (
    file: File,
    franchiseId: string | null = null
  ) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("documents")
      .insert({
        name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        franchise_id: franchiseId,
      })
      .select()
      .single();

    if (error) throw error;

    setDocuments((prev) => [data, ...prev]);
    return data;
  };

  const downloadDocument = async (document: MyDocument) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(document.file_path);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = document.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    downloadDocument,
    refetch: fetchDocuments,
  };
}

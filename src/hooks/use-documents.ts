"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MyDocument } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDocuments = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;

      try {
        setLoading(true);
        setError(null);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("TIMEOUT")), 15000);
        });

        const fetchPromise = supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });

        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]);

        if (error) {
          throw error;
        }

        setDocuments(data || []);
        setLoading(false);
      } catch (err) {
        const error = err as Error;
        console.error(
          `Documents fetch error (attempt ${retryCount + 1}):`,
          error
        );

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            fetchDocuments(retryCount + 1);
          }, delay);
        } else {
          // Mensaje específico para timeout
          if (error.message === "TIMEOUT") {
            setError("Error consiguiendo los ficheros");
          } else {
            setError(
              error.message ||
                "Error al cargar documentos después de varios intentos"
            );
          }
          setLoading(false);
        }
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (
    file: File,
    franchiseId: string | null = null
  ) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

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

    if (error) {
      throw error;
    }

    setDocuments((prev) => [data, ...prev]);
    return data;
  };

  const downloadDocument = async (document: MyDocument) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(document.file_path);

    if (error) {
      throw error;
    }

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
    refetch: () => fetchDocuments(0),
  };
}

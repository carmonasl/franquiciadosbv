"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client"; // instancia cliente pura
import { MyDocument } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  const fetchDocuments = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching documents...");
      console.time("fetchDocuments");

      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, name, file_path, file_size, mime_type, created_at, uploaded_by"
        )
        .order("created_at", { ascending: false });

      console.timeEnd("fetchDocuments");
      console.log({ data, error });

      if (!isMounted.current) return;

      if (error) {
        console.error("Error fetching documents:", error);
        setError("Error cargando documentos. Intenta recargar.");
        setDocuments([]);
        return;
      }

      const safeData = (data || []).map((doc) => ({
        ...doc,
        uploaded_by: doc.uploaded_by || "desconocido",
      }));

      setDocuments(safeData);
    } catch (err) {
      if (!isMounted.current) return;
      console.error("Unexpected error fetching documents:", err);
      setError("Error inesperado cargando documentos.");
      setDocuments([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchDocuments();

    return () => {
      isMounted.current = false;
    };
  }, [fetchDocuments]);

  const uploadDocument = async (
    file: File,
    franchiseId: string | null = null
  ) => {
    try {
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

      const safeDocument: MyDocument = {
        ...data,
        uploaded_by: data.uploaded_by || "desconocido",
      };

      setDocuments((prev) => [safeDocument, ...prev]);
      return safeDocument;
    } catch (err) {
      console.error("Error uploading document:", err);
      throw err;
    }
  };

  const downloadDocument = async (document: MyDocument) => {
    try {
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
    } catch (err) {
      console.error("Error downloading document:", err);
      throw err;
    }
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

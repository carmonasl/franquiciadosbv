"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MyDocument } from "@/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDocuments = async () => {
    try {
      console.log("🚀 Starting fetchDocuments...");
      setLoading(true);

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("📊 Supabase response:", {
        data,
        error,
        dataLength: data?.length,
      });

      if (error) {
        console.error("❌ Supabase error:", error);
        setError(error.message);
      } else {
        console.log("✅ Setting documents:", data?.length || 0);
        setDocuments(data || []);
        setError(null);
      }
    } catch (err) {
      console.error("💥 Catch error:", err);
      setError("Error inesperado al cargar documentos");
    } finally {
      console.log("🏁 Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadDocument = async (file: File) => {
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
    refetch: fetchDocuments,
  };
}

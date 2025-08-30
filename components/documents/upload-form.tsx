"use client";

import { useState } from "react";
import { useDocuments } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { uploadDocument } = useDocuments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadDocument(file);
      setSuccess("Documento subido exitosamente");
      setFile(null);
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al subir el documento"
      );
    }

    setUploading(false);
  };

  return (
    <Card className="bg-white border border-[#159a93]/30 shadow-sm rounded-2xl hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#159a93]">
          <Upload className="h-5 w-5" />
          Subir Documento
        </CardTitle>
        <CardDescription className="text-gray-600">
          Sube archivos para que estén disponibles para todos los franquiciados
        </CardDescription>
      </CardHeader>

      <CardContent className="bg-white text-gray-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="rounded-lg border border-red-200 bg-red-50"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="rounded-lg border border-[#159a93]/30 bg-[#159a93]/10 text-[#159a93]">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">Seleccionar archivo</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.png"
              required
              className="bg-white"
            />
            {file && (
              <p className="text-sm text-gray-500">
                Archivo seleccionado: {file.name} (
                {(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-[#159a93] hover:bg-[#128376] text-white"
          >
            {uploading ? "Subiendo..." : "Subir Documento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

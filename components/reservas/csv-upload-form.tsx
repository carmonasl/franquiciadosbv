"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface CsvRow {
  [key: string]: string | number | boolean | null | undefined;
}

export function CsvUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setMessage({
        type: "error",
        text: "Por favor selecciona un archivo CSV válido",
      });
      return;
    }

    setFile(selectedFile);
    setMessage(null);

    // Preview del archivo
    const text = await selectedFile.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length > 0) {
      const headerLine = lines[0];
      const csvHeaders = headerLine
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      setHeaders(csvHeaders);

      // Mostrar primeras 5 filas como preview
      const previewData: CsvRow[] = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = lines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));
        const row: CsvRow = {};
        csvHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        previewData.push(row);
      }
      setPreview(previewData);
    }
  };

  const parseCsvData = (text: string): CsvRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: CsvRow = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      data.push(row);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({
        type: "error",
        text: "Por favor selecciona un archivo CSV",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const csvData = parseCsvData(text);

      if (csvData.length === 0) {
        throw new Error(
          "El archivo CSV está vacío o no tiene el formato correcto"
        );
      }

      // Aquí debes ajustar el nombre de la tabla y los campos según tu esquema
      const tableName = "your_table_name"; // Cambia por el nombre de tu tabla

      let successCount = 0;
      let errorCount = 0;

      for (const row of csvData) {
        try {
          // Intentar hacer upsert (insert o update)
          // Ajusta los campos según tu tabla
          const { data, error } = await supabase
            .from(tableName)
            .upsert(row, {
              onConflict: "id", // Cambia por el campo único de tu tabla
              ignoreDuplicates: false,
            })
            .select();

          if (error) {
            console.error("Error procesando fila:", error);
            errorCount++;
          } else {
            if (data && data.length > 0) {
              successCount++;
            }
          }
        } catch (rowError) {
          console.error("Error en fila individual:", rowError);
          errorCount++;
        }
      }

      setMessage({
        type: successCount > 0 ? "success" : "error",
        text: `Procesamiento completado: ${successCount} registros procesados exitosamente${
          errorCount > 0 ? `, ${errorCount} errores` : ""
        }`,
      });

      // Limpiar formulario si todo fue exitoso
      if (errorCount === 0) {
        setFile(null);
        setPreview([]);
        setHeaders([]);
        // Recargar la página para ver los nuevos datos
        window.location.reload();
      }
    } catch (error) {
      console.error("Error cargando CSV:", error);
      setMessage({
        type: "error",
        text: `Error procesando el archivo: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csv-file">Archivo CSV</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg border ${
            message.type === "success"
              ? "border-green-200 bg-green-50"
              : message.type === "error"
              ? "border-red-200 bg-red-50"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : message.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <FileText className="h-4 w-4 text-blue-600" />
            )}
            <span
              className={`text-sm ${
                message.type === "success"
                  ? "text-green-800"
                  : message.type === "error"
                  ? "text-red-800"
                  : "text-blue-800"
              }`}
            >
              {message.text}
            </span>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Vista previa (primeras 5 filas):
          </h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-2 py-1 text-left font-medium text-gray-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    {headers.map((header, colIndex) => (
                      <td key={colIndex} className="px-2 py-1 text-gray-900">
                        {String(row[header] || "").substring(0, 50)}
                        {String(row[header] || "").length > 50 ? "..." : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-[#159a93] hover:bg-[#159a93]/90"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Cargar CSV
          </div>
        )}
      </Button>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          • El archivo debe ser un CSV válido con headers en la primera fila
        </p>
        <p>• Los registros existentes se actualizarán, los nuevos se crearán</p>
        <p>
          • Asegúrate de que los nombres de las columnas coincidan con tu tabla
        </p>
      </div>
    </div>
  );
}

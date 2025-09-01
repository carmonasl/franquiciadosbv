"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Search, Download, RefreshCw } from "lucide-react";

interface DataRow {
  [key: string]: string | number | boolean | null | undefined;
}

interface CsvDataTableProps {
  data: DataRow[];
}

export function CsvDataTable({ data }: CsvDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener columnas dinámicamente de los datos
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(
      (key) =>
        !["id", "created_at", "updated_at"].includes(key) ||
        ["id"].includes(key) // Mantener solo el id
    );
  }, [data]);

  // Filtrar datos por término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleExportCsv = () => {
    if (filteredData.length === 0) return;

    const headers = columns.join(",");
    const csvContent = filteredData
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col];
            // Escapar valores que contengan comas o comillas
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          })
          .join(",")
      )
      .join("\n");

    const fullCsv = headers + "\n" + csvContent;
    const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `datos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const formatValue = (
    value: string | number | boolean | null | undefined
  ): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (typeof value === "string") {
      // Verificar si es una fecha válida en formato ISO
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (dateRegex.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("es-ES");
        }
      }
      // Truncar strings largos
      if (value.length > 100) {
        return value.substring(0, 100) + "...";
      }
    }
    return String(value);
  };

  const getValueColor = (
    value: string | number | boolean | null | undefined
  ): string => {
    if (value === null || value === undefined || value === "")
      return "text-gray-400";
    if (typeof value === "boolean")
      return value ? "text-green-600" : "text-red-600";
    return "text-gray-900";
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-500">
          Carga un archivo CSV para ver los datos aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar en los datos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
          {filteredData.length} de {data.length} registros
        </span>
        {searchTerm && (
          <span>
            Filtrando por: <strong>&ldquo;{searchTerm}&rdquo;</strong>
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row, index) => (
                <tr
                  key={
                    typeof row.id === "string" || typeof row.id === "number"
                      ? row.id
                      : index
                  }
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 text-sm whitespace-nowrap"
                    >
                      <span className={getValueColor(row[column])}>
                        {formatValue(row[column])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a{" "}
            {Math.min(endIndex, filteredData.length)} de {filteredData.length}{" "}
            registros
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

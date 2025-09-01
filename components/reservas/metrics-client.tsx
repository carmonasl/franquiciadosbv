"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReservaData {
  sucursal: string;
  grupo_edad_inicio: number;
  grupo_edad_fin: number;
  total_reservas: number;
  ventas_totales: number;
  ticket_medio: number;
}

interface ChartData {
  grupo_edad: string;
  [key: string]: string | number;
}

interface ReservasChartClientProps {
  data: ReservaData[];
}

interface TooltipPayload {
  color: string;
  dataKey: string;
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const COLORS = ["#159a93", "#2563eb", "#dc2626"];

export function ReservasChartClient({ data }: ReservasChartClientProps) {
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [selectedSucursales, setSelectedSucursales] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Initialize sucursales when data is loaded
  useEffect(() => {
    if (data.length > 0) {
      const uniqueSucursales = [
        ...new Set(data.map((item) => item.sucursal)),
      ].sort();

      setSucursales(uniqueSucursales);
      // Auto-select first 3 sucursales
      setSelectedSucursales(uniqueSucursales.slice(0, 3));
    }
  }, [data]);

  // Process chart data when selected sucursales change
  useEffect(() => {
    if (data.length === 0 || selectedSucursales.length === 0) {
      setChartData([]);
      return;
    }

    // Filter data by selected sucursales
    const filteredData = data.filter((item) =>
      selectedSucursales.includes(item.sucursal)
    );

    // Get unique age groups and sort them
    const gruposEdad = [
      ...new Set(
        filteredData.map(
          (item) => `${item.grupo_edad_inicio}-${item.grupo_edad_fin}`
        )
      ),
    ].sort((a, b) => {
      const [startA] = a.split("-").map(Number);
      const [startB] = b.split("-").map(Number);
      return startA - startB;
    });

    // Create chart data structure
    const processedData: ChartData[] = gruposEdad.map((grupoEdad) => {
      const baseData: ChartData = { grupo_edad: grupoEdad };

      selectedSucursales.forEach((sucursal) => {
        const item = filteredData.find(
          (d) =>
            d.sucursal === sucursal &&
            `${d.grupo_edad_inicio}-${d.grupo_edad_fin}` === grupoEdad
        );
        baseData[sucursal] = item?.total_reservas || 0;
      });

      return baseData;
    });

    setChartData(processedData);
  }, [data, selectedSucursales]);

  const handleSucursalChange = (sucursal: string, checked: boolean) => {
    if (checked && selectedSucursales.length < 3) {
      setSelectedSucursales([...selectedSucursales, sucursal]);
    } else if (!checked) {
      setSelectedSucursales(selectedSucursales.filter((s) => s !== sucursal));
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">
            Grupo de edad: {label} años
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => {
              // Calcular el total de reservas para esta sucursal
              const sucursalData = data.filter(
                (item) => item.sucursal === entry.dataKey
              );
              const totalSucursal = sucursalData.reduce(
                (sum, item) => sum + item.total_reservas,
                0
              );

              const porcentaje =
                totalSucursal > 0
                  ? ((entry.value / totalSucursal) * 100).toFixed(1)
                  : "0.0";

              return (
                <p
                  key={index}
                  className="text-sm"
                  style={{ color: entry.color }}
                >
                  <span className="font-medium">{entry.dataKey}:</span>{" "}
                  {entry.value} reservas ({porcentaje}%)
                </p>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow border border-[#159a93]/30 p-6">
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Sin datos para mostrar</p>
          <p className="text-sm">
            No hay información disponible para generar la gráfica
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-[#159a93]/30 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#159a93] mb-2">
              Análisis de Reservas por Sucursal y Edad
            </h2>
            <p className="text-gray-600 text-sm">
              Comparativa de reservas entre sucursales segmentadas por grupos de
              edad
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total de registros</div>
            <div className="text-2xl font-bold text-[#159a93]">
              {data.length}
            </div>
          </div>
        </div>
      </div>

      {/* Sucursal Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Seleccionar sucursales para comparar (máximo 3)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {sucursales.map((sucursal) => {
            const isSelected = selectedSucursales.includes(sucursal);
            const isDisabled = !isSelected && selectedSucursales.length >= 3;

            return (
              <label
                key={sucursal}
                className={`flex items-center p-2 rounded-md border cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#159a93] bg-[#159a93]/10"
                    : isDisabled
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    : "border-gray-200 hover:border-[#159a93]/50 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) =>
                    handleSucursalChange(sucursal, e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 mr-2 ${
                    isSelected
                      ? "bg-[#159a93] border-[#159a93]"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span
                    className={`font-medium text-xs truncate ${
                      isSelected ? "text-[#159a93]" : "text-gray-700"
                    }`}
                    title={sucursal}
                  >
                    {sucursal}
                  </span>
                  {isSelected && (
                    <div
                      className="w-2 h-2 rounded-full ml-1 flex-shrink-0"
                      style={{
                        backgroundColor:
                          COLORS[
                            selectedSucursales.indexOf(sucursal) % COLORS.length
                          ],
                      }}
                    />
                  )}
                </div>
              </label>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {selectedSucursales.length}/3 sucursales seleccionadas
        </p>
      </div>

      {/* Chart */}
      {chartData.length > 0 && selectedSucursales.length > 0 ? (
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="grupo_edad"
                tick={{ fontSize: 11 }}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#666"
                label={{
                  value: "Total de Reservas",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                iconType="rect"
                fontSize={12}
              />
              {selectedSucursales.map((sucursal, index) => (
                <Bar
                  key={sucursal}
                  dataKey={sucursal}
                  fill={COLORS[index % COLORS.length]}
                  name={sucursal}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Selecciona sucursales</p>
            <p className="text-sm">
              Elige hasta 3 sucursales para comparar sus datos de reservas
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {selectedSucursales.length > 0 && chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedSucursales.map((sucursal, index) => {
            const sucursalData = data.filter(
              (item) => item.sucursal === sucursal
            );
            const totalReservas = sucursalData.reduce(
              (sum, item) => sum + item.total_reservas,
              0
            );
            const totalVentas = sucursalData.reduce(
              (sum, item) => sum + item.ventas_totales,
              0
            );
            const gruposEdad = sucursalData.length;

            return (
              <div
                key={sucursal}
                className="p-4 rounded-lg border-l-4 bg-gray-50"
                style={{ borderLeftColor: COLORS[index % COLORS.length] }}
              >
                <h4
                  className="font-semibold text-gray-800 mb-3 text-sm truncate"
                  title={sucursal}
                >
                  {sucursal}
                </h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Total reservas:</span>
                    <span className="font-medium text-gray-800">
                      {totalReservas.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ventas totales:</span>
                    <span className="font-medium text-gray-800">
                      €
                      {totalVentas.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ticket promedio:</span>
                    <span className="font-medium text-gray-800">
                      €
                      {totalReservas > 0
                        ? (totalVentas / totalReservas).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span>Grupos de edad:</span>
                    <span className="font-medium text-gray-800">
                      {gruposEdad}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

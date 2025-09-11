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
  LineChart,
  Line,
} from "recharts";

interface ResumenManualData {
  storage_id: number;
  storage_name: string;
  año: number;
  mes: number;
  total_item_cost: number;
  total_extras_cost: number;
  total_cost: number;
  numero_reservas: number;
  numero_vehiculos: number;
  facturacion_por_vehiculo: number;
}

interface ChartData {
  periodo: string;
  año: number;
  mes: number;
  [key: string]: string | number;
}

interface ResumenManualChartClientProps {
  data: ResumenManualData[];
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

const COLORS = [
  "#159a93",
  "#2563eb",
  "#dc2626",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#f97316",
  "#06b6d4",
];

const formatCurrency = (value: number) => {
  return `€${value.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatNumber = (value: number) => {
  return value.toLocaleString("es-ES");
};

const getMonthName = (month: number) => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[month - 1] || "";
};

export function ResumenManualChartClient({
  data,
}: ResumenManualChartClientProps) {
  const [storages, setStorages] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);
  const [activeChart, setActiveChart] = useState<"facturacion" | "reservas">(
    "facturacion"
  );
  const [chartDataFacturacion, setChartDataFacturacion] = useState<ChartData[]>(
    []
  );
  const [chartDataReservas, setChartDataReservas] = useState<ChartData[]>([]);

  // Initialize storages when data is loaded
  useEffect(() => {
    if (data.length > 0) {
      const uniqueStorages = [
        ...new Set(data.map((item) => item.storage_name)),
      ].sort();

      setStorages(uniqueStorages);
      // Auto-select first 6 storages
      setSelectedStorages(uniqueStorages.slice(0, 6));
    }
  }, [data]);

  // Process chart data when selected storages change
  useEffect(() => {
    if (data.length === 0 || selectedStorages.length === 0) {
      setChartDataFacturacion([]);
      setChartDataReservas([]);
      return;
    }

    // Filter data by selected storages
    const filteredData = data.filter((item) =>
      selectedStorages.includes(item.storage_name)
    );

    // Get unique periods and sort them
    const periodos = [
      ...new Set(
        filteredData.map(
          (item) => `${item.año}-${item.mes.toString().padStart(2, "0")}`
        )
      ),
    ].sort();

    // Create chart data structure for facturación por vehículo
    const processedDataFacturacion: ChartData[] = periodos.map((periodo) => {
      const [año, mes] = periodo.split("-");
      const baseData: ChartData = {
        periodo: `${getMonthName(parseInt(mes))} ${año}`,
        año: parseInt(año),
        mes: parseInt(mes),
      };

      selectedStorages.forEach((storage) => {
        const item = filteredData.find(
          (d) =>
            d.storage_name === storage &&
            d.año === parseInt(año) &&
            d.mes === parseInt(mes)
        );
        baseData[storage] = item?.facturacion_por_vehiculo || 0;
      });

      return baseData;
    });

    // Create chart data structure for número de reservas
    const processedDataReservas: ChartData[] = periodos.map((periodo) => {
      const [año, mes] = periodo.split("-");
      const baseData: ChartData = {
        periodo: `${getMonthName(parseInt(mes))} ${año}`,
        año: parseInt(año),
        mes: parseInt(mes),
      };

      selectedStorages.forEach((storage) => {
        const item = filteredData.find(
          (d) =>
            d.storage_name === storage &&
            d.año === parseInt(año) &&
            d.mes === parseInt(mes)
        );
        baseData[storage] = item?.numero_reservas || 0;
      });

      return baseData;
    });

    setChartDataFacturacion(processedDataFacturacion);
    setChartDataReservas(processedDataReservas);
  }, [data, selectedStorages]);

  const handleStorageChange = (storage: string, checked: boolean) => {
    if (checked && selectedStorages.length < 6) {
      setSelectedStorages([...selectedStorages, storage]);
    } else if (!checked) {
      setSelectedStorages(selectedStorages.filter((s) => s !== storage));
    }
  };

  const CustomTooltipFacturacion = ({
    active,
    payload,
    label,
  }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">Período: {label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.dataKey}:</span>{" "}
                {formatCurrency(entry.value)} por vehículo
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipReservas = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">Período: {label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.dataKey}:</span>{" "}
                {formatNumber(entry.value)} reservas
              </p>
            ))}
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
            No hay información disponible para generar las gráficas
          </p>
        </div>
      </div>
    );
  }

  const currentChartData =
    activeChart === "facturacion" ? chartDataFacturacion : chartDataReservas;

  return (
    <div className="bg-white rounded-2xl shadow border border-[#159a93]/30 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#159a93] mb-2">
              Análisis de Resumen Manual de Reservas
            </h2>
            <p className="text-gray-600 text-sm">
              Facturación por vehículo y número de reservas por sede y período
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

      {/* Chart Type Selector */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveChart("facturacion")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeChart === "facturacion"
                ? "bg-[#159a93] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Facturación por Vehículo
          </button>
          <button
            onClick={() => setActiveChart("reservas")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeChart === "reservas"
                ? "bg-[#159a93] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Número de Reservas
          </button>
        </div>
      </div>

      {/* Storage Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Seleccionar sedes para comparar (máximo 6)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {storages.map((storage) => {
            const isSelected = selectedStorages.includes(storage);
            const isDisabled = !isSelected && selectedStorages.length >= 6;

            return (
              <label
                key={storage}
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
                    handleStorageChange(storage, e.target.checked)
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
                    title={storage}
                  >
                    {storage}
                  </span>
                  {isSelected && (
                    <div
                      className="w-2 h-2 rounded-full ml-1 flex-shrink-0"
                      style={{
                        backgroundColor:
                          COLORS[
                            selectedStorages.indexOf(storage) % COLORS.length
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
          {selectedStorages.length}/6 sedes seleccionadas
        </p>
      </div>

      {/* Chart */}
      {currentChartData.length > 0 && selectedStorages.length > 0 ? (
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === "facturacion" ? (
              <LineChart
                data={currentChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="periodo"
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
                  tickFormatter={formatCurrency}
                  label={{
                    value: "Facturación por Vehículo (€)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltipFacturacion />} />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  iconType="line"
                  fontSize={12}
                />
                {selectedStorages.map((storage, index) => (
                  <Line
                    key={storage}
                    type="monotone"
                    dataKey={storage}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={{
                      fill: COLORS[index % COLORS.length],
                      strokeWidth: 2,
                      r: 4,
                    }}
                    name={storage}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={currentChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="periodo"
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
                    value: "Número de Reservas",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltipReservas />} />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  iconType="rect"
                  fontSize={12}
                />
                {selectedStorages.map((storage, index) => (
                  <Bar
                    key={storage}
                    dataKey={storage}
                    fill={COLORS[index % COLORS.length]}
                    name={storage}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
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
            <p className="text-lg font-medium mb-2">Selecciona sedes</p>
            <p className="text-sm">
              Elige hasta 6 sedes para comparar sus datos de{" "}
              {activeChart === "facturacion"
                ? "facturación por vehículo"
                : "reservas"}
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {selectedStorages.length > 0 && currentChartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedStorages.map((storage, index) => {
            const storageData = data.filter(
              (item) => item.storage_name === storage
            );
            const totalReservas = storageData.reduce(
              (sum, item) => sum + item.numero_reservas,
              0
            );
            const totalVehiculos = storageData.reduce(
              (sum, item) => sum + item.numero_vehiculos,
              0
            );
            const totalFacturacion = storageData.reduce(
              (sum, item) => sum + item.total_cost,
              0
            );
            const factPromedio =
              totalVehiculos > 0 ? totalFacturacion / totalVehiculos : 0;
            const periodos = storageData.length;

            return (
              <div
                key={storage}
                className="p-4 rounded-lg border-l-4 bg-gray-50"
                style={{ borderLeftColor: COLORS[index % COLORS.length] }}
              >
                <h4
                  className="font-semibold text-gray-800 mb-3 text-sm truncate"
                  title={storage}
                >
                  {storage}
                </h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Total reservas:</span>
                    <span className="font-medium text-gray-800">
                      {formatNumber(totalReservas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total vehículos:</span>
                    <span className="font-medium text-gray-800">
                      {formatNumber(totalVehiculos)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Facturación total:</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(totalFacturacion)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fact. promedio/vehículo:</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(factPromedio)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span>Períodos registrados:</span>
                    <span className="font-medium text-gray-800">
                      {periodos}
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

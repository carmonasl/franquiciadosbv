import { createClient } from "@/lib/supabase/server";
import { ResumenManualChartClient } from "./metrics-client";

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

interface RawResumenData {
  "Rental Storage ID"?: number | string;
  Año?: number | string;
  Mes?: number | string;
  "Rental Storage Nombre"?: string;
  "Total Item Cost"?: number | string;
  "Total Extras Cost"?: number | string;
  "Total Cost"?: number | string;
  "Número de reservas"?: number | string;
  "Número de vehículos"?: number | string;
  "Facturación por vehículo"?: number | string;
  [key: string]: string | number | boolean | null | undefined;
}

const rental_storage_map: { [key: number]: string } = {
  13: "ALCALÁ DE HENARES",
  20: "ALMERIA",
  45: "BADALONA",
  15: "BARCELONA",
  10: "BILBAO",
  43: "GIRONA",
  34: "IBIZA",
  30: "LOZOYA SIERRA NORTE",
  24: "LUGO - SARRIA",
  23: "MADRID - LAS ROZAS",
  3: "MADRID - SAN FERNANDO DE HENARES",
  8: "MADRID - SUR",
  17: "MADRID POZUELO",
  6: "MADRID SUR - TOLEDO",
  32: "MURCIA",
  42: "SEGOVIA",
  36: "VALENCIA",
  39: "VALENCIA",
  27: "VILLARREAL",
  48: "ZAMORA",
  0: "TOTAL",
};

export default async function ResumenManualChart() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="bg-white rounded-2xl shadow border border-[#159a93]/30 p-6">
        <div className="text-center text-red-600">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Acceso restringido</h3>
          <p className="text-sm">
            Debes iniciar sesión para ver el análisis de resumen manual de
            reservas.
          </p>
        </div>
      </div>
    );
  }

  // Fetch data from the resumen_manual_reservas table
  const { data: rawData, error: dataError } = await supabase
    .from("resumen_mensual_reservas")
    .select("*")
    .order("Año", { ascending: true })
    .order("Mes", { ascending: true });

  if (dataError) {
    return (
      <div className="bg-white rounded-2xl shadow border border-[#159a93]/30 p-6">
        <div className="text-center text-red-600">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Tabla no disponible</h3>
          <p className="text-sm mb-2">
            Error al cargar la tabla &ldquo;resumen_manual_reservas&rdquo;:
          </p>
          <p className="text-xs bg-red-50 p-2 rounded border">
            {dataError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!rawData || rawData.length === 0) {
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
          <h3 className="text-lg font-semibold mb-2">Sin datos disponibles</h3>
          <p className="text-sm">
            No se encontraron datos en la tabla resumen_mensual_reservas.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Verifica que existan datos y que la tabla esté correctamente
            configurada.
          </p>
        </div>
      </div>
    );
  }

  // Process and normalize data
  const processedData: ResumenManualData[] = rawData.map(
    (item: RawResumenData) => {
      const storageId = Number(item["Rental Storage ID"]) || 0;
      const storageName =
        rental_storage_map[storageId] ||
        item["Rental Storage Nombre"] ||
        "Desconocido";

      return {
        storage_id: storageId,
        storage_name: storageName,
        año: Number(item["Año"]) || 0,
        mes: Number(item["Mes"]) || 0,
        total_item_cost: Number(item["Total Item Cost"]) || 0,
        total_extras_cost: Number(item["Total Extras Cost"]) || 0,
        total_cost: Number(item["Total Cost"]) || 0,
        numero_reservas: Number(item["Número de reservas"]) || 0,
        numero_vehiculos: Number(item["Número de vehículos"]) || 0,
        facturacion_por_vehiculo: Number(item["Facturación por vehículo"]) || 0,
      };
    }
  );

  // Filter out invalid data but INCLUDE TOTAL storage (ID = 0)
  const validData = processedData.filter(
    (item) =>
      item.storage_name &&
      item.storage_name.trim() !== "" &&
      item.storage_name !== "Desconocido" &&
      item.año > 0 &&
      item.mes > 0 &&
      item.mes <= 12
    // Ahora incluimos TOTAL (ID = 0) para mostrar "TOTAL" como opción
  );

  if (validData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow border border-[#159a93]/30 p-6">
        <div className="text-center text-amber-600">
          <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Datos incompletos</h3>
          <p className="text-sm">
            Los datos de la tabla no tienen el formato esperado o contienen
            valores nulos.
          </p>
          <p className="text-xs text-amber-700 mt-2">
            Se encontraron {rawData.length} registros pero ninguno tiene datos
            válidos para mostrar.
          </p>
        </div>
      </div>
    );
  }

  // Pass the processed data to the client component
  return <ResumenManualChartClient data={validData} />;
}

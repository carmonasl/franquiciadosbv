import { createClient } from "@/lib/supabase/server";
import { ReservasChartClient } from "./metrics-client";

interface ReservaData {
  sucursal: string;
  grupo_edad_inicio: number;
  grupo_edad_fin: number;
  total_reservas: number;
  ventas_totales: number;
  ticket_medio: number;
}

interface RawViewData {
  sucursal?: string;
  "NOMBRE SUCURSAL"?: string;
  nombre_sucursal?: string;
  grupo_edad_inicio?: number | string;
  grupo_edad_fin?: number | string;
  total_reservas?: number | string;
  ventas_totales?: number | string;
  ticket_medio?: number | string;
  [key: string]: string | number | boolean | null | undefined;
}

export default async function ReservasChart() {
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
            Debes iniciar sesión para ver el análisis de reservas.
          </p>
        </div>
      </div>
    );
  }

  // Fetch data from the view
  const { data: viewData, error: viewError } = await supabase
    .from("reservas_por_sucursal_edad")
    .select("*")
    .order("grupo_edad_inicio", { ascending: true });

  if (viewError) {
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
          <h3 className="text-lg font-semibold mb-2">Vista no disponible</h3>
          <p className="text-sm mb-2">
            Error al cargar la vista &ldquo;reservas_por_sucursal_edad&rdquo;:
          </p>
          <p className="text-xs bg-red-50 p-2 rounded border">
            {viewError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!viewData || viewData.length === 0) {
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
            No se encontraron datos en la vista reservas_por_sucursal_edad.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Verifica que existan datos y que la vista esté correctamente
            configurada.
          </p>
        </div>
      </div>
    );
  }

  // Process and normalize data
  const processedData: ReservaData[] = viewData.map((item: RawViewData) => ({
    sucursal:
      item.sucursal || item["NOMBRE SUCURSAL"] || item.nombre_sucursal || "",
    grupo_edad_inicio: Number(item.grupo_edad_inicio) || 0,
    grupo_edad_fin: Number(item.grupo_edad_fin) || 0,
    total_reservas: Number(item.total_reservas) || 0,
    ventas_totales: Number(item.ventas_totales) || 0,
    ticket_medio: Number(item.ticket_medio) || 0,
  }));

  // Filter out invalid data and exclude 2025 data
  const validData = processedData.filter(
    (item) =>
      item.sucursal &&
      item.sucursal.trim() !== "" &&
      item.grupo_edad_inicio > 0 &&
      item.grupo_edad_fin > 0 &&
      item.grupo_edad_inicio !== 2025 // Excluir datos con edad_inicio = 2025
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
            Los datos de la vista no tienen el formato esperado o contienen
            valores nulos.
          </p>
          <p className="text-xs text-amber-700 mt-2">
            Se encontraron {viewData.length} registros pero ninguno tiene datos
            válidos para mostrar.
          </p>
        </div>
      </div>
    );
  }

  // Pass the processed data to the client component
  return <ReservasChartClient data={validData} />;
}

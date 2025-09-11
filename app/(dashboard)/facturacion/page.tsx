import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CsvUploadForm } from "@/components/reservas/csv-upload-form";
import { CsvDataTable } from "@/components/reservas/csv-data-table";
import ResumenManualChart from "@/components/facturacion/metrics-server";

interface ResumenManualRecord {
  "Rental Storage ID"?: number;
  Año?: number;
  Mes?: number;
  "Rental Storage Nombre"?: string;
  "Total Item Cost"?: number;
  "Total Extras Cost"?: number;
  "Total Cost"?: number;
  "Número de reservas"?: number;
  "Número de vehículos"?: number;
  "Facturación por vehículo"?: number;
  [key: string]: string | number | boolean | null | undefined;
}

interface UserProfile {
  id: string;
  role: string;
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

export default async function ResumenManualPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Fetch user profile to check admin status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  const userProfile = profile as UserProfile | null;
  const isAdmin = userProfile?.role === "admin";

  // Fetch existing data from resumen_mensual_reservas table
  const { data: existingData, error: dataError } = await supabase
    .from("resumen_mensual_reservas")
    .select("*", { count: "exact" })
    .order("Año", { ascending: false })
    .order("Mes", { ascending: false })
    .limit(10000);

  if (dataError) {
    console.error("Error fetching data:", dataError);
  }

  // Get unique storage locations for statistics
  const uniqueStorages = existingData
    ? [
        ...new Set(
          existingData
            .map((item: ResumenManualRecord) => {
              const storageId = item["Rental Storage ID"];
              return storageId && rental_storage_map[storageId]
                ? rental_storage_map[storageId]
                : item["Rental Storage Nombre"];
            })
            .filter((storage): storage is string => Boolean(storage))
        ),
      ]
    : [];

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-[#159a93]">
          Dashboard de Resumen Manual de Reservas
        </h1>
        <p className="mt-1 text-gray-600">
          Análisis de facturación y reservas por sede y período
        </p>
      </div>

      {/* Gráficas de análisis */}
      <div className="w-full">
        <ResumenManualChart />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de datos existentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-[#159a93]/30">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Datos existentes ({existingData?.length || 0} registros)
          </h2>
          <CsvDataTable data={existingData || []} />
        </div>

        {/* Formulario de carga CSV (solo admin) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow p-4 border border-[#159a93]/30">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cargar archivo CSV
            </h2>
            <CsvUploadForm />
          </div>
        )}

        {/* Información adicional para usuarios no admin */}
        {!isAdmin && (
          <div className="bg-blue-50 rounded-2xl shadow p-4 border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">
              Información
            </h2>
            <div className="space-y-3 text-sm text-blue-700">
              <p className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Solo los administradores pueden cargar nuevos datos CSV
                </span>
              </p>
              <p className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Puedes consultar y analizar todos los datos de facturación y
                  reservas
                </span>
              </p>
              <p className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 012 0v3a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Usa las gráficas para visualizar tendencias de facturación y
                  reservas por sede
                </span>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">
                Estadísticas actuales
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded p-2">
                  <span className="text-gray-500">Total registros</span>
                  <div className="font-bold text-blue-600">
                    {existingData?.length || 0}
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <span className="text-gray-500">Sedes únicas</span>
                  <div className="font-bold text-blue-600">
                    {uniqueStorages.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

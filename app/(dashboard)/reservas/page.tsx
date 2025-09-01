import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CsvUploadForm } from "@/components/reservas/csv-upload-form";
import { CsvDataTable } from "@/components/reservas/csv-data-table";
import ReservasChart from "@/components/reservas/metrics-server";

interface ReservaRecord {
  "NOMBRE SUCURSAL"?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface UserProfile {
  id: string;
  role: string;
  [key: string]: string | number | boolean | null | undefined;
}

export default async function CsvUploadPage() {
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

  // Fetch existing data from your table
  const { data: existingData, error: dataError } = await supabase
    .from("reservasimportadas")
    .select("*", { count: "exact" })
    .order("NOMBRE SUCURSAL", { ascending: false })
    .limit(10000);

  if (dataError) {
    console.error("Error fetching data:", dataError);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-[#159a93]">
          Dashboard de Reservas
        </h1>
        <p className="mt-1 text-gray-600">
          Gestión y análisis de datos de reservas por sucursal
        </p>
      </div>

      {/* Gráfica de análisis */}
      <div className="w-full">
        <ReservasChart />
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
                  Puedes consultar y analizar todos los datos existentes
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
                  Usa la gráfica para visualizar tendencias por sucursal y edad
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
                  <span className="text-gray-500">Sucursales únicas</span>
                  <div className="font-bold text-blue-600">
                    {existingData
                      ? [
                          ...new Set(
                            existingData
                              .map(
                                (item: ReservaRecord) => item["NOMBRE SUCURSAL"]
                              )
                              .filter((sucursal): sucursal is string =>
                                Boolean(sucursal)
                              )
                          ),
                        ].length
                      : 0}
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

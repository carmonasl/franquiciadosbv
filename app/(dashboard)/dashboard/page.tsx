import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Newspaper, BarChart3, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const stats = [
    {
      title: "Documentos",
      value: "12",
      description: "Archivos disponibles",
      icon: FileText,
    },
    {
      title: "Noticias",
      value: "5",
      description: "Publicaciones recientes",
      icon: Newspaper,
    },
    {
      title: "Informes",
      value: "3",
      description: "Reportes generados",
      icon: BarChart3,
    },
    ...(isAdmin
      ? [
          {
            title: "Franquiciados",
            value: "8",
            description: "Usuarios activos",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8 bg-gray-50 p-6 rounded-xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido al portal,{" "}
          <span className="text-[#159a93] font-semibold">
            {profile?.full_name || user.email}
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border border-gray-200 shadow-sm hover:shadow-md transition rounded-xl bg-white"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#159a93]/10">
                <stat.icon className="h-4 w-4 text-[#159a93]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-gray-800">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Nuevo documento subido
                  </p>
                  <p className="text-xs text-gray-500">
                    Manual de operaciones v2.1
                  </p>
                </div>
                <span className="text-xs text-gray-400">2h</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Noticia publicada</p>
                  <p className="text-xs text-gray-500">
                    Nuevas políticas de franquicia
                  </p>
                </div>
                <span className="text-xs text-gray-400">1d</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-gray-800">
              Información de tu Franquicia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">ID de Franquicia</p>
              <p className="font-medium text-gray-900">
                {profile?.franchise_id || "No asignado"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Rol</p>
              <p className="font-medium text-gray-900">
                {profile?.role === "admin" ? "Administrador" : "Franquiciado"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">
                {profile?.email || user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

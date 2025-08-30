import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  BarChart3,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Noticias", href: "/news", icon: Newspaper },
  { name: "Informes", href: "/reports", icon: BarChart3 },
];

export async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email || "Usuario";
  const role = profile?.role === "admin" ? "Administrador" : "Franquiciado";

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-[#159a93] shadow-sm">
      {/* Logo / Marca fijo arriba */}
      <div className="h-16 flex items-center justify-center bg-[#159a93]">
        <h1 className="text-lg font-bold text-white">BookingVans</h1>
      </div>

      {/* Contenido scrollable */}
      <div className="flex flex-1 flex-col pt-6 pb-4">
        {/* Navegación */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#159a93]"
            >
              <item.icon className="h-5 w-5 text-gray-400 group-hover:text-[#159a93]" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Línea separadora (color corporativo suave) */}
        <div className="mx-4 my-4 h-px bg-[#159a93]/30" />

        {/* Usuario */}
        <div className="px-4 space-y-2">
          <div className="text-sm">
            <div className="font-semibold text-gray-800">{displayName}</div>
            <div className="text-xs font-medium text-[#159a93]">{role}</div>
          </div>

          <form action="/auth/signout" method="post">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="w-full justify-start text-gray-600 hover:text-[#159a93]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

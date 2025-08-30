import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MobileNavLink } from "./mobile-nav-link";

const navigation = [
  { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
  { name: "Documentos", href: "/documents", iconName: "FileText" },
  { name: "Noticias", href: "/news", iconName: "Newspaper" },
  { name: "Informes", href: "/reports", iconName: "BarChart3" },
];

export async function MobileNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email || "Usuario";
  const role = profile?.role === "admin" ? "Administrador" : "Franquiciado";

  return (
    <div
      id="mobile-nav"
      className="hidden bg-white border-b border-[#159a93] shadow-sm"
    >
      <div className="px-4 py-4">
        {/* User info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-800">
            {displayName}
          </div>
          <div className="text-xs text-[#159a93]">{role}</div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-4">
          {navigation.map((item) => (
            <MobileNavLink
              key={item.name}
              href={item.href}
              name={item.name}
              iconName={item.iconName}
            />
          ))}
        </nav>

        {/* Sign out */}
        <form action="/auth/signout" method="post">
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}

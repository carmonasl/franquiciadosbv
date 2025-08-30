import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // No renderizar si no hay usuario
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email || "Usuario";
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="bg-white border-b border-[#159a93] shadow-sm h-16 flex items-center justify-between px-6">
      {/* Branding / título */}
      <div className="flex items-center space-x-2">
        <div className="h-8 w-1.5 rounded-full bg-[#159a93]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Bienvenido, <span className="text-[#159a93]">{displayName}</span>
        </h2>
      </div>

      {/* Menú usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1.5 transition">
            <Avatar className="h-9 w-9 border border-gray-200">
              <AvatarFallback className="bg-[#159a93] text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4 text-[#159a93]" />
            Perfil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

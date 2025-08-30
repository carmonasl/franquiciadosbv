import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { MobileMenuButton } from "./mobile-menu-button";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
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
    <header className="bg-white border-b border-[#159a93] shadow-sm h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button and branding */}
      <div className="flex items-center space-x-3">
        {/* Mobile menu button - only visible on mobile */}
        <div className="lg:hidden">
          <MobileMenuButton />
        </div>

        {/* Branding */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-1.5 rounded-full bg-[#159a93]" />
          <h2 className="text-base lg:text-lg font-semibold text-gray-900">
            <span className="hidden sm:inline">Bienvenido, </span>
            <span className="text-[#159a93]">
              {/* Show only first name on mobile, full name on larger screens */}
              <span className="sm:hidden">{displayName.split(" ")[0]}</span>
              <span className="hidden sm:inline">{displayName}</span>
            </span>
          </h2>
        </div>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1.5 transition">
            <Avatar className="h-8 w-8 lg:h-9 lg:w-9 border border-gray-200">
              <AvatarFallback className="bg-[#159a93] text-white font-semibold text-sm">
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

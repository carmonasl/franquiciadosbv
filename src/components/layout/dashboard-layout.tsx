"use client";

import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🏗 DashboardLayout useEffect", { user, profile, loading });

    // Redirigir si ya cargó y no hay usuario
    if (!loading && !user) {
      console.log("➡️ No user, redirecting to /login");
      router.push("/login");
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Cargando sesión y perfil...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, no mostramos nada (ya se redirigirá)
  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

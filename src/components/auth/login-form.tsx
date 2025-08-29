"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const DEBUG = false; // poner false para producción

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🧹 Intentando limpiar sesión previa (sin bloquear)...");
      supabase.auth
        .signOut()
        .catch((err) =>
          console.warn("⚠️ Error al limpiar sesión previa:", err)
        );

      console.log("🚀 Intentando login con:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("📦 Respuesta login:", { data, error });

      if (error) {
        setError(error.message);
        console.error("❌ Error de login:", error);
      } else if (data?.user) {
        console.log("✅ Login exitoso, usuario:", data.user.id);
        if (!DEBUG && data.user) {
          window.location.href = "/dashboard";
        }
      } else {
        setError("No se devolvió usuario en el login");
        console.warn("⚠️ Login sin usuario en data:", data);
      }
    } catch (err) {
      console.error("🔥 Excepción en login:", err);
      setError("Error inesperado al iniciar sesión");
    } finally {
      console.log("🔄 Fin de handleSubmit, desactivando loading");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder al portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Si no está autenticado, redirigir al login
    redirect("/auth/login");
  }

  // Si está autenticado, redirigir al dashboard
  redirect("/dashboard");
}

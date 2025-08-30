import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewsList from "@/components/news/news-list";
import { NewsForm } from "@/components/news/news-form";

export default async function NewsPage() {
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

  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#159a93]">Noticias</h1>
          <p className="mt-1 text-gray-600">
            Mantente al día con las últimas novedades de la franquicia
          </p>
        </div>

        {/* Formulario de creación (solo admin) */}
        {isAdmin && (
          <div className="lg:w-1/3">
            <NewsForm />
          </div>
        )}
      </div>

      {/* Lista de noticias */}
      <div className="space-y-4">
        <NewsList />
      </div>
    </div>
  );
}

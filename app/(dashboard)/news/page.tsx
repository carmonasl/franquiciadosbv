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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Noticias</h1>
          <p className="text-gray-600">
            Mantente al día con las últimas novedades de la franquicia
          </p>
        </div>

        {/* Only the form is a client component */}
        {isAdmin && <NewsForm />}
      </div>

      {/* Server component for listing news */}
      <NewsList />
    </div>
  );
}

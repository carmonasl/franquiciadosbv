import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentList from "@/components/documents/document-list";
import { UploadForm } from "@/components/documents/upload-form";

export default async function DocumentsPage() {
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
    <div className="flex-1 w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <p className="text-gray-600">
          Gestiona y descarga los documentos de la franquicia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DocumentList />
        </div>

        {isAdmin && (
          <div>
            <UploadForm />
          </div>
        )}
      </div>
    </div>
  );
}

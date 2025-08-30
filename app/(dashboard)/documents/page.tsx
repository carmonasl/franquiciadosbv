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
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-[#159a93]">Documentos</h1>
        <p className="mt-1 text-gray-600">
          Gestiona y descarga los documentos de la franquicia
        </p>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de documentos */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 border border-[#159a93]/30">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Lista de documentos
          </h2>
          <DocumentList />
        </div>

        {/* Subida de documentos (solo admin) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow p-4 border border-[#159a93]/30">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Subir documento
            </h2>
            <UploadForm />
          </div>
        )}
      </div>
    </div>
  );
}

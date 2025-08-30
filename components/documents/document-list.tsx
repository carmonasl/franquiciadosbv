import { createClient } from "@/lib/supabase/server";
import { MyDocument } from "@/types";

export default async function DocumentList() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <p className="p-6 text-red-600 bg-red-50 rounded-xl border border-red-200">
        Debes iniciar sesión para ver tus documentos.
      </p>
    );
  }

  // Fetch documents
  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  if (docsError) {
    return (
      <p className="p-6 text-red-600 bg-red-50 rounded-xl border border-red-200">
        Error al cargar documentos: {docsError.message}
      </p>
    );
  }

  return (
    <div className="text-gray-900">
      {!documents || documents.length === 0 ? (
        <p className="text-gray-500 italic">No se encontraron documentos.</p>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc: MyDocument) => (
            <li
              key={doc.id}
              className="p-4 bg-white border border-[#159a93]/30 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-800">{doc.name}</p>
                <p className="text-sm text-gray-500">
                  {doc.mime_type} — {(doc.file_size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs text-gray-400">
                  Subido: {new Date(doc.created_at).toLocaleString()}
                </p>
              </div>
              <a
                href={doc.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#159a93] font-medium hover:underline"
              >
                Ver
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

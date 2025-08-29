import { createClient } from "@/lib/supabase/server";
import { MyDocument } from "@/types";

export default async function DocumentList() {
  // ⚡ Await the client first
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <p className="p-6 text-red-600">
        You must be logged in to see your documents.
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
      <p className="p-6 text-red-600">
        Error fetching documents: {docsError.message}
      </p>
    );
  }

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">My Documents</h1>

      {!documents || documents.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc: MyDocument) => (
            <li
              key={doc.id}
              className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{doc.name}</p>
                <p className="text-sm">
                  {doc.mime_type} — {(doc.file_size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs">
                  Uploaded: {new Date(doc.created_at).toLocaleString()}
                </p>
              </div>
              <a
                href={doc.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

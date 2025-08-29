'use client'

import { useAuth } from '@/hooks/use-auth'
import { DocumentList } from '@/components/documents/document-list'
import { UploadForm } from '@/components/documents/upload-form'

export default function DocumentsPage() {
    const { isAdmin } = useAuth()

    return (
        <div className="space-y-6">
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
    )
}
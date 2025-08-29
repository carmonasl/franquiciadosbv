'use client'

import { useState } from 'react'
import { useDocuments } from '@/hooks/use-documents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload } from 'lucide-react'

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const { uploadDocument } = useDocuments()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setError('')
        setSuccess('')

        try {
            await uploadDocument(file)
            setSuccess('Documento subido exitosamente')
            setFile(null)
            // Reset file input
            const fileInput = document.getElementById('file') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al subir el documento')
        }

        setUploading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Subir Documento
                </CardTitle>
                <CardDescription>
                    Sube archivos para que estén disponibles para todos los franquiciados
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="file">Seleccionar archivo</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.png"
                            required
                        />
                        {file && (
                            <p className="text-sm text-gray-500">
                                Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={!file || uploading} className="w-full">
                        {uploading ? 'Subiendo...' : 'Subir Documento'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
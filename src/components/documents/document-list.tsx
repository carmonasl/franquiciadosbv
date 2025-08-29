'use client'

import { useDocuments } from '@/hooks/use-documents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MyDocument } from '@/types'

export function DocumentList() {
    const { documents, loading, error, downloadDocument } = useDocuments()

    const handleDownload = async (document: MyDocument) => {
        try {
            await downloadDocument(document)
        } catch (error) {
            console.error('Error downloading document:', error)
        }
    }

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        if (bytes === 0) return '0 Bytes'
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Cargando documentos...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos Disponibles
                </CardTitle>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No hay documentos disponibles
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tamaño</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((document) => (
                                <TableRow key={document.id}>
                                    <TableCell className="font-medium">{document.name}</TableCell>
                                    <TableCell>{formatFileSize(document.file_size)}</TableCell>
                                    <TableCell>
                                        {formatDistanceToNow(new Date(document.created_at), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownload(document)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
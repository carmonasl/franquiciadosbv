'use client'

import { useDocuments } from '@/hooks/use-documents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MyDocument } from '@/types'

// Skeleton de loading
function DocumentSkeleton() {
    return (
        <TableRow>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></TableCell>
            <TableCell><div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div></TableCell>
        </TableRow>
    )
}

export function DocumentList() {
    const { documents, loading, error, downloadDocument, refetch } = useDocuments()

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

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documentos Disponibles
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetch}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription className="flex justify-between items-center">
                            <span>{error}</span>
                            <Button variant="outline" size="sm" onClick={refetch}>
                                Reintentar
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {(documents.length === 0 && !loading && !error) ? (
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
                            {loading && documents.length === 0 ? (
                                // Mostrar skeletons solo si no hay documentos cargados
                                Array.from({ length: 3 }).map((_, i) => (
                                    <DocumentSkeleton key={i} />
                                ))
                            ) : (
                                documents.map((document) => (
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

                {loading && documents.length > 0 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                        Actualizando...
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
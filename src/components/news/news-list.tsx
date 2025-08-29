'use client'

import { useNews } from '@/hooks/use-news'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function NewsList() {
    const { news, loading, error, deleteNews } = useNews()
    const { isAdmin } = useAuth()

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
            try {
                await deleteNews(id)
            } catch (error) {
                console.error('Error deleting news:', error)
            }
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Cargando noticias...</span>
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
        <div className="space-y-6">
            {news.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            No hay noticias publicadas
                        </p>
                    </CardContent>
                </Card>
            ) : (
                news.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant="secondary">
                                            {formatDistanceToNow(new Date(item.created_at), {
                                                addSuffix: true,
                                                locale: es,
                                            })}
                                        </Badge>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}
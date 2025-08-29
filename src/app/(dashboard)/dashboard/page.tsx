'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Newspaper, BarChart3, Users } from 'lucide-react'
import { AuthDebugComponent } from "@/components/auth-debug-component";
import { SessionDebugTest } from "@/components/session-debug-test";
import { DirectSupabaseTest } from "@/components/direct-supabase-test";

export default function DashboardPage() {
    const { profile, isAdmin } = useAuth()

    const stats = [
        {
            title: 'Documentos',
            value: '12',
            description: 'Archivos disponibles',
            icon: FileText,
        },
        {
            title: 'Noticias',
            value: '5',
            description: 'Publicaciones recientes',
            icon: Newspaper,
        },
        {
            title: 'Informes',
            value: '3',
            description: 'Reportes generados',
            icon: BarChart3,
        },
        ...(isAdmin ? [{
            title: 'Franquiciados',
            value: '8',
            description: 'Usuarios activos',
            icon: Users,
        }] : []),
    ]

    return (
        <div className="space-y-6">
            <div>
                <DirectSupabaseTest />
                <SessionDebugTest />
                <AuthDebugComponent />


                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                    Bienvenido al portal, {profile?.full_name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Nuevo documento subido</p>
                                    <p className="text-xs text-gray-500">Manual de operaciones v2.1</p>
                                </div>
                                <div className="text-xs text-gray-500">2h</div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Noticia publicada</p>
                                    <p className="text-xs text-gray-500">Nuevas políticas de franquicia</p>
                                </div>
                                <div className="text-xs text-gray-500">1d</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Información de tu Franquicia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">ID de Franquicia</p>
                                <p className="font-medium">{profile?.franchise_id || 'No asignado'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rol</p>
                                <p className="font-medium">
                                    {profile?.role === 'admin' ? 'Administrador' : 'Franquiciado'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{profile?.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
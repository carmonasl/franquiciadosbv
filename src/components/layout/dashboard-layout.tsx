'use client'

import { useAuth } from '@/hooks/use-auth'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Solo redirigir si terminó de cargar Y no hay usuario
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Mostrar loading solo por máximo 3 segundos
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    // Si no hay usuario después de cargar, no mostrar nada (se redirige)
    if (!user) {
        return null
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
'use client'

import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function Header() {
    const { profile, signOut } = useAuth()

    return (
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
            <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                    Bienvenido, {profile?.full_name}
                </h2>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-sm">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
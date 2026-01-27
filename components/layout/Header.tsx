'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Menu, LogOut } from "lucide-react"

export function Header({ onMobileMenuOpen }: { onMobileMenuOpen?: () => void }) {
    const { user, signOut } = useAuth()

    return (
        <header className="flex h-16 items-center border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={onMobileMenuOpen}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-bold md:hidden">Playa de Autos</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                        {user?.email || 'Usuario'}
                    </span>
                    <Button variant="outline" size="sm" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    )
}

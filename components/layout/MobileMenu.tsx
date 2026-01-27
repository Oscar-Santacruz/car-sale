'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Car, Calculator, Settings, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Clientes",
        href: "/clients",
        icon: Users,
    },
    {
        title: "Inventario",
        href: "/inventory",
        icon: Car,
    },
    {
        title: "Ventas y Cuotero",
        href: "/sales",
        icon: Calculator,
    },
    {
        title: "Configuración",
        href: "/settings",
        icon: Settings,
    },
]

export function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const pathname = usePathname()

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Playa de Autos</SheetTitle>
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>
                <div className="py-4">
                    <div className="space-y-1 px-3">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => onOpenChange(false)}
                                    className={cn(
                                        "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        isActive
                                            ? "bg-accent/50 text-accent-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {link.title}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

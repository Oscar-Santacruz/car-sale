'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Car, Calculator, FileText, Settings } from "lucide-react"

const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin"],
    },
    {
        title: "Clientes",
        href: "/clients",
        icon: Users,
        roles: ["admin", "operator"],
    },
    {
        title: "Inventario",
        href: "/inventory",
        icon: Car,
        roles: ["admin", "operator"],
    },
    {
        title: "Ventas y Cuotero",
        href: "/sales",
        icon: Calculator,
        roles: ["admin", "operator"],
    },
    {
        title: "Configuración",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
    },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    // TODO: Get user role from context
    const userRole = "admin" // Mock for now

    return (
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Playa de Autos
                    </h2>
                    <div className="space-y-1">
                        {sidebarLinks.map((link) => {
                            if (!link.roles.includes(userRole)) return null
                            const Icon = link.icon
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        pathname === link.href || pathname.startsWith(link.href + "/")
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
            </div>
        </div>
    )
}

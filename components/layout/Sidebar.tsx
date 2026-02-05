'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { sidebarLinks } from "@/lib/nav"

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    // TODO: Get user role from context
    const userRole = "admin" // Mock for now

    return (
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-4 px-4 flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Laneri Automotores"
                            className="h-16 w-auto object-contain"
                        />
                    </div>
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

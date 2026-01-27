'use client'

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileMenu } from "@/components/layout/MobileMenu"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar className="hidden md:block w-64 flex-shrink-0" />
            <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />
                <main className="flex-1 p-6 overflow-y-auto bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    )
}

import { AppLayoutClient } from "@/components/layout/AppLayoutClient"
import { getCurrentUserRole } from "@/lib/permissions"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const role = await getCurrentUserRole() || 'viewer'

    return (
        <AppLayoutClient userRole={role}>
            {children}
        </AppLayoutClient>
    )
}

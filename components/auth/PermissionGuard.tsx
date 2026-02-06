import { getCurrentUserRole, UserRole } from '@/lib/permissions'

interface PermissionGuardProps {
    children: React.ReactNode
    requiredRole?: UserRole
    fallback?: React.ReactNode
}

export async function PermissionGuard({
    children,
    requiredRole = 'user',
    fallback
}: PermissionGuardProps) {
    const role = await getCurrentUserRole()

    const roleHierarchy: Record<UserRole, number> = {
        admin: 3,
        user: 2,
        viewer: 1
    }

    const userLevel = roleHierarchy[role as UserRole] || 0
    const requiredLevel = roleHierarchy[requiredRole]

    if (userLevel < requiredLevel) {
        if (fallback) return <>{fallback}</>

        return (
            <div className="p-8 text-center border border-destructive rounded-lg bg-destructive/10">
                <h2 className="text-xl font-bold text-destructive">Acceso Denegado</h2>
                <p className="text-muted-foreground mt-2">
                    No tienes permisos para acceder a esta función.
                </p>
            </div>
        )
    }

    return <>{children}</>
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type UserRole = 'admin' | 'user' | 'viewer'

export type Permission =
    | 'create:sales'
    | 'edit:sales'
    | 'delete:sales'
    | 'process:payments'
    | 'view:reports'
    | 'manage:users'
    | 'manage:settings'

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
    const supabase = await getSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return (profile?.role as UserRole) || null
}

export async function isAdmin(): Promise<boolean> {
    const role = await getCurrentUserRole()
    return role === 'admin'
}

export async function hasPermission(permission: Permission): Promise<boolean> {
    const role = await getCurrentUserRole()

    const permissions: Record<UserRole, Permission[]> = {
        admin: [
            'create:sales',
            'edit:sales',
            'delete:sales',
            'process:payments',
            'view:reports',
            'manage:users',
            'manage:settings'
        ],
        user: [
            'create:sales',
            'process:payments',
            'view:reports'
        ],
        viewer: [
            'view:reports'
        ]
    }

    const userPermissions = permissions[role || 'user'] || []
    return userPermissions.includes(permission)
}

export async function requirePermission(permission: Permission): Promise<void> {
    const hasAccess = await hasPermission(permission)
    if (!hasAccess) {
        throw new Error('Insufficient permissions')
    }
}

export async function requireAdmin() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const admin = await isAdmin()
    if (!admin) {
        throw new Error('Admin access required')
    }

    return user
}

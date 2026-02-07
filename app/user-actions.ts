'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/permissions'

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

function getSupabaseAdmin() {
    // Service role client needed for admin auth operations (deleteUser)
    // This bypasses RLS, so use carefully and ONLY after checking permissions (requireAdmin)
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

async function getOrganizationId(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (profile?.organization_id) return profile.organization_id

    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found")
    return org.id
}

export async function getUsersAction() {
    await requireAdmin()

    const supabase = await getSupabase()
    const organization_id = await getOrganizationId(supabase)

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id,
            role,
            email,
            created_at
        `)
        .eq('organization_id', organization_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        throw error
    }

    return profiles
}

export async function updateUserRoleAction(userId: string, newRole: 'admin' | 'user' | 'viewer') {
    await requireAdmin()

    // Using regular client since we added RLS policy for Admins to UPDATE profiles
    const supabase = await getSupabase()

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) {
        console.error('Error updating user role:', error)
        throw error
    }

    revalidatePath('/users')
}

export async function deleteUserAction(userId: string) {
    await requireAdmin()

    // Must use Admin client to delete from auth.users
    const supabaseAdmin = getSupabaseAdmin()

    // Delete from auth.users (this will cascade to profiles via trigger)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        throw error
    }

    revalidatePath('/users')
}

// Admin: Send password reset email to user
export async function adminResetUserPasswordAction(userId: string, userEmail: string) {
    await requireAdmin()

    const supabaseAdmin = getSupabaseAdmin()

    // Send password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
        console.error('Error sending password reset:', error)
        throw new Error('Error al enviar el correo de recuperación')
    }

    return { success: true }
}

// Admin: Set temporary password and force change
export async function setTemporaryPasswordAction(userId: string, tempPassword: string) {
    await requireAdmin()

    const supabaseAdmin = getSupabaseAdmin()
    const supabase = await getSupabase()

    // Update user password
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
    )

    if (passwordError) {
        console.error('Error setting temporary password:', passwordError)
        throw new Error('Error al establecer contraseña temporal')
    }

    // Set force_password_change flag
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ force_password_change: true })
        .eq('id', userId)

    if (updateError) {
        console.error('Error setting force_password_change:', updateError)
        throw new Error('Error al configurar cambio forzado')
    }

    revalidatePath('/users')
    return { success: true }
}

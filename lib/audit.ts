import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function logAuditAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: any
) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
    })

    if (error) {
        console.error('Error logging audit action:', error)
        // We generally don't want to throw here and fail the main action just because logging failed,
        // but for high security it might be required. For now, just log error.
    }
}

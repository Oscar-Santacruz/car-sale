'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Export deletion action
import { deleteClientAction as deleteClientActionFn } from './deletion-actions'
export async function deleteClientAction(id: string, reason?: string) { return deleteClientActionFn(id, reason) }

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

async function getAuthOrgId() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        throw new Error('No organization found')
    }

    return profile.organization_id
}

interface BulkImportResult {
    success: number
    errors: Array<{ row: number; error: string }>
}

interface ClientImportData {
    nombre?: string
    ci?: string
    telefono?: string
    direccion?: string
    email?: string
}

export async function bulkImportClientsAction(clients: ClientImportData[]): Promise<BulkImportResult> {
    const supabase = await getSupabase()
    const orgId = await getAuthOrgId()

    const results: BulkImportResult = {
        success: 0,
        errors: []
    }

    for (let i = 0; i < clients.length; i++) {
        const client = clients[i]
        const row = i + 2 // Excel row (header = 1, data starts at 2)

        try {
            // Validar campos requeridos
            if (!client.nombre || client.nombre.trim() === '') {
                results.errors.push({ row, error: 'El nombre es requerido' })
                continue
            }

            if (!client.ci || client.ci.trim() === '') {
                results.errors.push({ row, error: 'El CI es requerido' })
                continue
            }

            // Validar email si está presente
            if (client.email && client.email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(client.email)) {
                    results.errors.push({ row, error: 'Email inválido' })
                    continue
                }
            }

            // Insertar cliente
            const { error } = await supabase
                .from('clients')
                .insert({
                    organization_id: orgId,
                    name: client.nombre.trim(),
                    ci: client.ci.trim(),
                    phone: client.telefono?.trim() || null,
                    address: client.direccion?.trim() || null,
                    email: client.email?.trim() || null,
                    is_active: true
                })

            if (error) {
                if (error.code === '23505') { // Duplicate CI
                    results.errors.push({ row, error: `CI duplicado: ${client.ci}` })
                } else {
                    results.errors.push({ row, error: error.message })
                }
            } else {
                results.success++
            }
        } catch (error: any) {
            results.errors.push({ row, error: error.message || 'Error desconocido' })
        }
    }

    revalidatePath('/clients')
    return results
}

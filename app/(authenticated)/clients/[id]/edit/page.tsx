import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { updateClientAction } from "@/app/actions"
import { notFound } from "next/navigation"
import { ClientForm } from "@/components/clients/ClientForm"

async function getClient(id: string) {
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

    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()

    if (error) return null
    return data
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: PageProps) {
    const { id } = await params
    const client = await getClient(id)

    if (!client) {
        notFound()
    }

    return (
        <ClientForm
            initialData={{
                id: client.id,
                name: client.name,
                ci: client.ci,
                phone: client.phone || undefined,
                address: client.address || undefined,
                google_maps_link: client.google_maps_link || undefined
            }}
            action={updateClientAction}
            title="Editar Cliente"
            description="Actualice la información del cliente."
            submitLabel="Guardar Cambios"
            cancelHref={`/clients/${client.id}`}
        />
    )
}

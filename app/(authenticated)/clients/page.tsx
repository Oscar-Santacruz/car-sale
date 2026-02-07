import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import { ClientList } from "@/components/clients/ClientList"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { ClientFilters } from "@/components/clients/ClientFilters"

async function getClients(query?: string) {
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

    let supabaseQuery = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .eq('is_active', true) // Default to active clients only
        .order('created_at', { ascending: false })

    if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,ci.ilike.%${query}%`)
    }

    const { data: clients } = await supabaseQuery
    return clients || []
}

export default async function ClientsPage(props: {
    searchParams?: Promise<{
        query?: string
    }>
}) {
    const searchParams = await props.searchParams
    const query = searchParams?.query || ''
    const clients = await getClients(query)

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <ClientFilters />
                    <Link href="/clients/bulk-import">
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
                        </Button>
                    </Link>
                    <Link href="/clients/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
                        </Button>
                    </Link>
                </div>
            </div>

            <ClientList clients={clients} />
        </div>
    )
}

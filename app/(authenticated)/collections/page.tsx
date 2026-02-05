import { CollectionsManager } from "@/components/collections/CollectionsManager"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Wallet } from "lucide-react"
import { getClientsWithPendingSummary } from "@/app/collection-actions"

async function getOrgSettings() {
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

    const { data } = await supabase.from('organization_settings').select('*').single()
    return data
}

async function getBankAccounts() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value } },
        }
    )
    const { data } = await supabase.from('bank_accounts').select('*').eq('is_active', true)
    return data || []
}

export default async function CollectionsPage() {
    const clients = await getClientsWithPendingSummary()
    const settings = await getOrgSettings()
    const bankAccounts = await getBankAccounts()

    return (
        <div className="flex-1 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Caja y Cobranzas</h2>
                        <p className="text-muted-foreground">Gestión de pagos y cuotas</p>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <CollectionsManager clients={clients} settings={settings} bankAccounts={bankAccounts} />
            </div>
        </div>
    )
}

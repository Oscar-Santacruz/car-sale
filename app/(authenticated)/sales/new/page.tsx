import { NewSaleForm } from "@/components/sales/NewSaleForm"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getData() {
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

    const { data: clients } = await supabase.from('clients').select('id, name, ci')
    const { data: vehicles } = await supabase.from('vehicles').select('*').eq('status', 'available')
    const { data: bankAccounts } = await supabase.from('bank_accounts').select('*').eq('is_active', true)

    return {
        clients: clients || [],
        vehicles: vehicles || [],
        bankAccounts: bankAccounts || []
    }
}

export default async function NewSalePage() {
    const { clients, vehicles, bankAccounts } = await getData()

    return (
        <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="text-3xl font-bold tracking-tight">Nueva Venta</h2>
            </div>
            <div className="flex-1 min-h-0">
                <NewSaleForm clients={clients} vehicles={vehicles} bankAccounts={bankAccounts} />
            </div>
        </div>
    )
}

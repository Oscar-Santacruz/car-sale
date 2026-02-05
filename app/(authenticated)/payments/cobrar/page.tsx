import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { PaymentForm } from "@/components/collections/PaymentForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Force rebuild
export default async function ProcessPaymentPage({ searchParams }: { searchParams: Promise<{ installmentId: string, returnUrl?: string }> }) {
    const { installmentId, returnUrl: returnUrlParam } = await searchParams
    const returnUrl = returnUrlParam || '/collections'

    if (!installmentId) {
        redirect('/collections')
    }

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

    // Parallel Fetching
    const [installmentRes, bankRes, orgSettingsRes] = await Promise.all([
        supabase.from('installments').select(`
            *,
            sales (
                id,
                clients:clients!sales_client_id_fkey (
                    name,
                    ci
                ),
                vehicles (
                    brand,
                    model,
                    year,
                    plate
                )
            )
        `).eq('id', installmentId).single(),

        supabase.from('bank_accounts').select('*').eq('is_active', true).order('bank_name'),

        supabase.from('organization_settings').select('*').limit(1).single()
    ])

    if (installmentRes.error || !installmentRes.data) {
        console.error("Payment Page Error:", installmentRes.error)
        return (
            <div className="p-8 text-destructive border border-destructive rounded m-4">
                <h2 className="text-xl font-bold">Error Cargar Pago</h2>
                <pre className="mt-2 bg-slate-950 text-white p-4 rounded text-xs overflow-auto">
                    {JSON.stringify({ error: installmentRes.error, id: installmentId }, null, 2)}
                </pre>
            </div>
        )
    }

    const installment = installmentRes.data
    const bankAccounts = bankRes.data || []
    const settings = orgSettingsRes.data || {}

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center gap-4">
                <Link href={returnUrl}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Procesar Pago</h1>
            </div>

            <PaymentForm
                installment={installment}
                bankAccounts={bankAccounts}
                settings={settings}
                returnUrl={returnUrl}
            />
        </div>
    )
}

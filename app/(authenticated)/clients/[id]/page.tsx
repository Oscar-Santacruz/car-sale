
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, DollarSign, Calendar, AlertCircle, TrendingUp, ExternalLink } from "lucide-react"
import { notFound } from "next/navigation"
import { ClientDocumentManager } from "@/components/clients/client-document-manager"
import { ClientSalesList } from "@/components/clients/ClientSalesList"
import { formatCurrency } from "@/lib/utils"
import { calculateDaysOverdue } from "@/lib/overdue-calculations"

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

    if (error) {
        console.error("Error fetching client", error)
        return null
    }
    return data
}

async function getClientSales(clientId: string) {
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

    const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            vehicles (*),
            installments (*),
            payments (
                *,
                bank_accounts (*)
            )
        `)
        .eq('client_id', clientId)
        .order('sale_date', { ascending: false })

    if (error) {
        console.error("Error fetching client sales", error)
        return []
    }
    return data
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
    const { id } = await params
    const client = await getClient(id)
    const sales = await getClientSales(id)

    if (!client) {
        notFound()
    }

    // Calculate Client Stats
    let lastPayment = { date: null as Date | null, amount: 0 }
    let totalOverdue = 0
    let overdueCount = 0
    let maxDaysOverdue = 0

    sales.forEach(sale => {
        if (sale.installments) {
            sale.installments.forEach((inst: any) => {
                // Check Last Payment
                if (inst.status === 'paid' && inst.payment_date) {
                    const paymentDate = new Date(inst.payment_date)
                    if (!lastPayment.date || paymentDate > lastPayment.date) {
                        lastPayment.date = paymentDate
                        lastPayment.amount = inst.amount
                    }
                }

                // Check Overdue
                if (inst.status !== 'paid') {
                    const days = calculateDaysOverdue(inst.due_date)
                    if (days > 0) {
                        totalOverdue += Number(inst.amount)
                        overdueCount++
                        if (days > maxDaysOverdue) {
                            maxDaysOverdue = days
                        }
                    }
                }
            })
        }
    })

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/clients">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Detalle del Cliente</h2>
                </div>
                <Link href={`/clients/${client.id}/edit`}>
                    <Button>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                </Link>
            </div>

            {/* Payment Statistics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Último Pago</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {lastPayment.date ? formatCurrency(lastPayment.amount) : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {lastPayment.date ? lastPayment.date.toLocaleDateString() : 'Sin pagos registrados'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Días de Mora</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${maxDaysOverdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${maxDaysOverdue > 0 ? 'text-red-600' : ''}`}>
                            {maxDaysOverdue} días
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Máximo atraso actual
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monto Total Mora</CardTitle>
                        <DollarSign className={`h-4 w-4 ${totalOverdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(totalOverdue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Deuda vencida exigible
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cuotas en Mora</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${overdueCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-orange-600' : ''}`}>
                            {overdueCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cantidad de cuotas vencidas
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Datos Personales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                            <p className="text-lg font-medium">{client.name}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Cédula de Identidad</p>
                            <p className="text-lg">{client.ci}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                            <p className="text-lg">{client.phone || '-'}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                            <p className="text-lg">{client.address || '-'}</p>
                        </div>
                        {client.google_maps_link && (
                            <div className="pt-4 border-t mt-4">
                                <Link
                                    href={client.google_maps_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Ver en Google Maps
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ClientDocumentManager clientId={client.id} initialDocuments={client.documents} />
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Ventas Asociadas</h3>
                <ClientSalesList sales={sales} />
            </div>
        </div>
    )
}

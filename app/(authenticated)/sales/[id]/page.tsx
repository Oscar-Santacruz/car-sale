
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer } from "lucide-react"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

async function getSaleData(id: string) {
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

    // Use explicit relationships to avoid ambiguity
    const salePromise = supabase.from('sales')
        .select(`
            *,
            clients!sales_client_id_fkey(*), 
            codeudor:clients!sales_codeudor_id_fkey(*),
            vehicles(*)
        `)
        .eq('id', id)
        .single()
    // Order installments by number
    const installmentsPromise = supabase.from('installments').select('*').eq('sale_id', id).order('number', { ascending: true })

    const [saleRes, installmentsRes] = await Promise.all([salePromise, installmentsPromise])

    if (saleRes.error) {
        console.error("Error fetching sale", saleRes.error)
        return null
    }

    // Normalized data structure
    const saleData = {
        ...saleRes.data,
        client: saleRes.data.clients, // Main client
        codeudor: saleRes.data.codeudor // Codeudor (optional)
    }

    return {
        sale: saleData,
        installments: installmentsRes.data || []
    }
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function SaleDetailPage({ params }: PageProps) {
    const { id } = await params
    const data = await getSaleData(id)

    if (!data) notFound()

    const { sale, installments } = data

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/sales">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Detalle de Venta</h2>
                </div>
                {/* Future: Print Contract */}
                <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir Contrato
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Cliente (Titular)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nombre:</span>
                            <span className="font-medium">{sale.client?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">C.I.:</span>
                            <span>{sale.client?.ci}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Teléfono:</span>
                            <span>{sale.client?.phone || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                {sale.codeudor && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Codeudor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nombre:</span>
                                <span className="font-medium">{sale.codeudor.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">C.I.:</span>
                                <span>{sale.codeudor.ci}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Teléfono:</span>
                                <span>{sale.codeudor.phone || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className={sale.codeudor ? "" : "md:col-span-2 lg:col-span-1"}>
                    <CardHeader>
                        <CardTitle>Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Vehículo:</span>
                            <span className="font-medium">{sale.vehicles?.brand} {sale.vehicles?.model}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Año:</span>
                            <span>{sale.vehicles?.year}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Chapa:</span>
                            <span>{sale.vehicles?.plate || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio Lista:</span>
                            <span className="font-medium">${sale.vehicles?.list_price?.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Precio de Venta</p>
                        <p className="text-2xl font-bold">${sale.total_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Entrega Inicial</p>
                        <p className="text-2xl font-bold text-green-700">${sale.down_payment?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Financiado</p>
                        <p className="text-2xl font-bold text-blue-700">${sale.balance?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha Venta</p>
                        <p className="text-lg">{format(new Date(sale.sale_date), "dd/MM/yyyy")}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Plan de Pagos (Amortización)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Cuota #</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Fecha Pago</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {installments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No hay cuotas generadas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                installments.map((inst: any) => (
                                    <TableRow key={inst.id}>
                                        <TableCell className="font-medium">{inst.number}</TableCell>
                                        <TableCell>
                                            {format(new Date(inst.due_date), "dd MMM yyyy", { locale: es })}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${inst.amount?.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inst.status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {inst.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {inst.payment_date
                                                ? format(new Date(inst.payment_date), "dd/MM/yyyy")
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

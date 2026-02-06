
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Wallet, ExternalLink } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"
import { calculateDaysOverdue } from "@/lib/overdue-calculations"
import { ViewReceiptDialog } from "@/components/collections/ViewReceiptDialog"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { DeleteSaleButton } from "@/components/sales/DeleteSaleButton"

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
    const paymentsPromise = supabase.from('payments').select('*, bank_accounts(*)').eq('sale_id', id)
    const settingsPromise = supabase.from('organization_settings').select('*').limit(1).single()

    const [saleRes, installmentsRes, paymentsRes, settingsRes] = await Promise.all([salePromise, installmentsPromise, paymentsPromise, settingsPromise])

    if (saleRes.error) {
        console.error("Error fetching sale", saleRes.error)
        return null
    }

    // Normalized data structure
    const saleData = {
        ...saleRes.data,
        client: saleRes.data.clients,
        codeudor: saleRes.data.codeudor
    }

    return {
        sale: saleData,
        installments: installmentsRes.data || [],
        payments: paymentsRes.data || [],
        settings: settingsRes.data || {}
    }
}

const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    check: 'Cheque',
    pos: 'Tarjeta (POS)'
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getSaleData(id)

    if (!data) notFound()

    const { sale, installments, payments, settings } = data

    // Helper to get payment details
    const getPaymentDetails = (installmentId: string | null) => {
        return payments.find((p: any) => p.installment_id === installmentId)
    }

    const downPaymentInfo = getPaymentDetails(null)

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
                <div className="flex gap-2">
                    {/* Future: Print Contract */}
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir Contrato
                    </Button>
                    <PermissionGuard requiredRole="admin">
                        <DeleteSaleButton saleId={id} />
                    </PermissionGuard>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Cliente (Titular)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nombre:</span>
                            <div className="flex items-center gap-2">
                                <Link href={`/clients/${sale.client?.id}`} className="font-medium hover:underline flex items-center gap-1 text-blue-600">
                                    {sale.client?.name}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
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
                    <CardContent className="space-y-4">
                        <div className="relative h-48 w-full bg-muted/20 rounded-lg overflow-hidden border">
                            <Image
                                src={sale.vehicles?.image_url || sale.vehicles?.images?.[0] || '/LOGO.png'}
                                alt="Vehículo"
                                fill
                                className="object-contain p-2"
                                priority
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vehículo:</span>
                                <Link href={`/inventory/${sale.vehicles?.id}`} className="font-medium hover:underline flex items-center gap-1 text-blue-600">
                                    {sale.vehicles?.brand} {sale.vehicles?.model}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
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
                                <span className="font-medium">{formatCurrency(sale.vehicles?.list_price || 0)}</span>
                            </div>
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
                        <p className="text-2xl font-bold">{formatCurrency(sale.total_amount || 0)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Entrega Inicial</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(sale.down_payment || 0)}</p>
                        {downPaymentInfo && (
                            <div className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded">
                                <p className="font-medium">{PAYMENT_METHODS[downPaymentInfo.payment_method] || downPaymentInfo.payment_method}</p>
                                {downPaymentInfo.payment_method === 'transfer' && downPaymentInfo.bank_accounts && (
                                    <div className="text-[10px] text-gray-500">
                                        <p>{downPaymentInfo.bank_accounts.bank_name}</p>
                                        <p>{downPaymentInfo.bank_accounts.account_number} ({downPaymentInfo.bank_accounts.currency})</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Financiado</p>
                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(sale.balance || 0)}</p>
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
                                <TableHead>Vencimiento / Pago</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
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
                                installments.map((inst: any) => {
                                    const payment = getPaymentDetails(inst.id)
                                    const isPaid = inst.status === 'paid'
                                    const daysOverdue = calculateDaysOverdue(inst.due_date)
                                    const isOverdue = !isPaid && daysOverdue > 0

                                    return (
                                        <TableRow key={inst.id}>
                                            <TableCell className="font-medium">{inst.number}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium">{format(new Date(inst.due_date), "dd MMM yyyy", { locale: es })}</span>

                                                    {isPaid && (
                                                        <div className="flex flex-col text-[11px] text-muted-foreground">
                                                            <span className="text-green-700 font-medium">
                                                                Pagado el {payment?.created_at ? format(new Date(payment.created_at), "dd/MM/yyyy HH:mm") : '-'}
                                                            </span>

                                                            {payment && (
                                                                <>
                                                                    <div className="mt-1 p-1 bg-white/50 rounded border border-green-100">
                                                                        <div>{PAYMENT_METHODS[payment.payment_method] || payment.payment_method}</div>
                                                                        {payment.payment_method === 'transfer' && payment.bank_accounts && (
                                                                            <div className="block text-[10px] text-gray-500">
                                                                                <p>{payment.bank_accounts.bank_name}</p>
                                                                                <p>{payment.bank_accounts.account_number} ({payment.bank_accounts.currency})</p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Penalty / Mora Info */}
                                                                    {(payment.penalty_amount > 0 || differenceInDays(new Date(payment.created_at), new Date(inst.due_date)) > 0) && (
                                                                        <div className="mt-1 text-red-600 bg-red-50 p-1 rounded border border-red-100">
                                                                            <span className="block font-medium">Mora Aplicada:</span>
                                                                            {payment.penalty_amount > 0 && <span>{formatCurrency(payment.penalty_amount)}</span>}
                                                                            {differenceInDays(new Date(payment.created_at), new Date(inst.due_date)) > 0 && (
                                                                                <span className="ml-1">
                                                                                    ({differenceInDays(new Date(payment.created_at), new Date(inst.due_date))} días)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Ongoing Overdue (Unpaid) */}
                                                    {isOverdue && (
                                                        <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1 py-0.5 rounded w-fit">
                                                            {daysOverdue} días de mora
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(inst.amount)}
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
                                                {isPaid && payment ? (
                                                    <ViewReceiptDialog
                                                        payment={payment}
                                                        client={sale.client}
                                                        sale={{
                                                            vehicle_brand: sale.vehicles?.brand,
                                                            vehicle_model: sale.vehicles?.model,
                                                            vehicle_plate: sale.vehicles?.plate
                                                        }}
                                                        installmentNumber={inst.number}
                                                        settings={settings}
                                                    />
                                                ) : !isPaid && (
                                                    <Link href={`/payments/cobrar?installmentId=${inst.id}&returnUrl=/sales/${id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Wallet className="mr-2 h-4 w-4" /> Cobrar
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    )
}

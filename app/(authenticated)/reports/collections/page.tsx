
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MonthYearSelector } from "@/components/dashboard/MonthYearSelector"
import { formatCurrency } from "@/lib/utils"

async function getMonthlyPayments(year: number, month: number) {
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

    // Calculate generic range timestamps
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Check query structure: payments linked to sales, sales linked to clients/vehicles
    // Supabase can do deep nested joins:
    // select(*, sales(*, clients(name), vehicles(brand, model)))

    const { data: payments, error } = await supabase
        .from('payments')
        .select(`
            *,
            sales (
                clients:clients!sales_client_id_fkey (name),
                vehicles (brand, model, plate)
            ),
            installments (number)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching payments report", error)
        return []
    }

    return payments
}

interface PageProps {
    searchParams: Promise<{ month?: string; year?: string }>
}

export default async function CollectionsReportPage({ searchParams }: PageProps) {
    const params = await searchParams
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() // 0-indexed

    const year = params.year ? parseInt(params.year) : currentYear
    const month = params.month ? parseInt(params.month) : currentMonth

    const payments = await getMonthlyPayments(year, month)

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    const PAYMENT_METHODS: Record<string, string> = {
        cash: 'Efectivo',
        transfer: 'Transferencia',
        check: 'Cheque',
        pos: 'Tarjeta',
        card: 'Tarjeta'
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Reporte de Cobros</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <Card className="w-full md:w-auto h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthYearSelector
                            currentYear={year}
                            currentMonth={month}
                            baseUrl="/reports/collections"
                        />
                    </CardContent>
                </Card>

                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Resumen del Mes</span>
                            <span className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-1 rounded-md border border-green-100">
                                {formatCurrency(totalCollected)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Vehículo</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No hay cobros registrados en este periodo.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                {payment.sales?.clients?.name || 'Cliente Eliminado'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {payment.sales?.vehicles ? (
                                                        <>
                                                            {payment.sales.vehicles.brand} {payment.sales.vehicles.model}
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                                ({payment.sales.vehicles.plate || 'S/P'})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Info no disponible</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {payment.installment_id ? (
                                                    `Cuota #${payment.installments?.number || '?'}`
                                                ) : (
                                                    <span className="text-green-600 font-medium">Entrega Inicial</span>
                                                )}
                                                {payment.comment && <div className="text-xs text-muted-foreground">{payment.comment}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                    {PAYMENT_METHODS[payment.payment_method] || payment.payment_method}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-700">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

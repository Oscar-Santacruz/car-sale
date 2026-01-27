import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Car, TrendingUp } from "lucide-react"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { formatCurrency } from "@/lib/utils" // Ensure this exists and handles PYG
import { startOfMonth, endOfMonth, formatISO } from "date-fns"

async function getDashboardData() {
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

    const now = new Date()
    const start = formatISO(startOfMonth(now))
    const end = formatISO(endOfMonth(now))

    // Parallel fetching for performance
    const [
        salesResponse,
        clientsResponse,
        vehiclesResponse,
        installmentsResponse,
        recentSalesResponse
    ] = await Promise.all([
        // 1. Total Sales (Current Month)
        supabase
            .from('sales')
            .select('total_amount')
            .gte('sale_date', start)
            .lte('sale_date', end),

        // 2. Active Clients (Total)
        supabase
            .from('clients')
            .select('*', { count: 'exact', head: true }),

        // 3. Vehicles in Stock
        supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available'),

        // 4. Projected Collections (Installments due this month, pending)
        supabase
            .from('installments')
            .select('amount')
            .gte('due_date', start)
            .lte('due_date', end)
            .eq('status', 'pending'),

        // 5. Recent Sales with Relations
        supabase
            .from('sales')
            .select('*, clients(name), vehicles(brand, model, year)')
            .order('sale_date', { ascending: false })
            .limit(5)
    ])

    const totalSales = salesResponse.data?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0
    const projectedCollections = installmentsResponse.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    return {
        totalSales,
        clientsCount: clientsResponse.count || 0,
        vehiclesCount: vehiclesResponse.count || 0,
        projectedCollections,
        recentSales: recentSalesResponse.data || []
    }
}

export default async function DashboardPage() {
    const { totalSales, clientsCount, vehiclesCount, projectedCollections, recentSales } = await getDashboardData()

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ventas Totales (Mes)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
                        <p className="text-xs text-muted-foreground">
                            Mes actual
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clientes Activos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clientsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vehículos en Stock</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{vehiclesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Disponibles para venta
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cobranzas Proyectadas
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(projectedCollections)}</div>
                        <p className="text-xs text-muted-foreground">
                            Vencen este mes
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen de Ventas (Anual)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[240px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-md">
                            <p>Gráfico de Barras (Próximamente)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Ventas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentSales.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay ventas recientes</p>
                            ) : (
                                recentSales.map((sale: any) => (
                                    <div className="flex items-center" key={sale.id}>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {sale.vehicles?.brand} {sale.vehicles?.model} {sale.vehicles?.year}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {sale.clients?.name}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">{formatCurrency(sale.total_amount)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

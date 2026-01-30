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
    const todayISO = formatISO(now, { representation: 'date' })
    const nextMonthISO = formatISO(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()), { representation: 'date' })

    // Parallel fetching for performance
    const [
        salesResponse,
        clientsResponse,
        vehiclesResponse,
        stockValueResponse,
        portfolioResponse,
        overdueResponse,
        projectedCollectionsResponse,
        upcomingMaturitiesResponse,
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

        // 3. Vehicles in Stock (Count)
        supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available'),

        // 4. Vehicles Stock Value (Sum list_price)
        supabase
            .from('vehicles')
            .select('list_price')
            .eq('status', 'available'),

        // 5. Total Portfolio (Cartera) - All pending installments
        supabase
            .from('installments')
            .select('amount')
            .eq('status', 'pending'),

        // 6. Overdue Portfolio (Morosidad) - Pending and due_date < today
        supabase
            .from('installments')
            .select('amount')
            .eq('status', 'pending')
            .lt('due_date', todayISO),

        // 7. Projected Collections (This Month)
        supabase
            .from('installments')
            .select('amount')
            .gte('due_date', start)
            .lte('due_date', end)
            .eq('status', 'pending'),

        // 8. Upcoming Maturities (Next 30 days)
        supabase
            .from('installments')
            .select('*, sales(clients(name, ci), vehicles(brand, model, year, plate))')
            .eq('status', 'pending')
            .gte('due_date', todayISO)
            .lte('due_date', nextMonthISO)
            .order('due_date', { ascending: true })
            .limit(10),

        // 9. Recent Sales with Relations
        supabase
            .from('sales')
            .select('*, clients(name), vehicles(brand, model, year)')
            .order('sale_date', { ascending: false })
            .limit(5)
    ])

    const totalSales = salesResponse.data?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0
    const stockValue = stockValueResponse.data?.reduce((acc, curr) => acc + Number(curr.list_price), 0) || 0
    const totalPortfolio = portfolioResponse.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    const overdueAmount = overdueResponse.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    const projectedCollections = projectedCollectionsResponse.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    const delinquencyRate = totalPortfolio > 0 ? (overdueAmount / totalPortfolio) * 100 : 0

    return {
        totalSales,
        clientsCount: clientsResponse.count || 0,
        vehiclesCount: vehiclesResponse.count || 0,
        stockValue,
        totalPortfolio,
        delinquencyRate,
        projectedCollections,
        upcomingMaturities: upcomingMaturitiesResponse.data || [],
        recentSales: recentSalesResponse.data || []
    }
}

export default async function DashboardPage() {
    const {
        totalSales,
        stockValue,
        totalPortfolio,
        delinquencyRate,
        upcomingMaturities,
        recentSales,
        vehiclesCount
    } = await getDashboardData()

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
                        <CardTitle className="text-sm font-medium">Informe de Cartera</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalPortfolio)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total a Cobrar (Capital)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Morosidad</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${delinquencyRate > 10 ? 'text-red-500' : 'text-green-600'}`}>
                            {delinquencyRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            % de cartera vencida
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Valorizado</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stockValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {vehiclesCount} unidades disponibles
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Próximos Vencimientos (30 días)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingMaturities.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay vencimientos próximos</p>
                            ) : (
                                upcomingMaturities.map((inst: any) => (
                                    <div className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0" key={inst.id}>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {inst.sales?.clients?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Vence: {new Date(inst.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{formatCurrency(inst.amount)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                Cuota N° {inst.installment_number}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
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

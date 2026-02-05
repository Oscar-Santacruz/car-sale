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
        upcomingMaturitiesResponse, // Now fetches next 4 weeks for grouping
        recentSalesResponse
    ] = await Promise.all([
        // 1. Total Sales (Current Month) - Include down_payment to distinguish type
        supabase
            .from('sales')
            .select('sale_date, total_amount, down_payment')
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
            .select('amount, due_date')
            .eq('status', 'pending')
            .lt('due_date', todayISO),

        // 7. Projected Collections (This Month)
        supabase
            .from('installments')
            .select('amount')
            .gte('due_date', start)
            .lte('due_date', end)
            .eq('status', 'pending'),

        // 8. Upcoming Maturities (Next 4 Weeks / 30 days)
        supabase
            .from('installments')
            .select('*, sales(clients(name, ci), vehicles(brand, model, year, plate))')
            .eq('status', 'pending')
            .gte('due_date', todayISO)
            .lte('due_date', nextMonthISO)
            .order('due_date', { ascending: true }),

        // 9. Recent Sales with Relations
        supabase
            .from('sales')
            .select('*, clients(name), vehicles(brand, model, year)')
            .order('sale_date', { ascending: false })
            .limit(5)
    ])

    // Metrics Calculation

    // 1. Sales Breakdown (Cash vs Credit) - Grouped by ISO Week
    interface SalesWeeklyMetric {
        cashAmount: number;
        cashCount: number;
        creditAmount: number;
        creditCount: number;
        totalAmount: number;
        label: string; // "Semana X"
    }

    const weeklySales: Record<string, SalesWeeklyMetric> = {}
    let totalSalesCash = 0
    let totalSalesCredit = 0
    let countSalesCash = 0
    let countSalesCredit = 0

    // Helper to get week key (week of the month)
    const getWeekKey = (date: Date) => {
        const monthName = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
        const dayOfMonth = date.getDate()
        const weekOfMonth = Math.ceil(dayOfMonth / 7)

        const weekLabels = ['1ra', '2da', '3ra', '4ta', '5ta']
        const weekLabel = weekLabels[weekOfMonth - 1] || `${weekOfMonth}ta`

        return `${weekLabel} Semana ${monthName}`
    }

    salesResponse.data?.forEach(sale => {
        const amount = Number(sale.total_amount)
        const isCredit = amount > Number(sale.down_payment) // If total > down payment, it's credit
        const date = new Date(sale.sale_date)
        const weekKey = getWeekKey(date)

        if (!weeklySales[weekKey]) {
            weeklySales[weekKey] = { cashAmount: 0, cashCount: 0, creditAmount: 0, creditCount: 0, totalAmount: 0, label: weekKey }
        }

        if (isCredit) {
            totalSalesCredit += amount
            countSalesCredit++
            weeklySales[weekKey].creditAmount += amount
            weeklySales[weekKey].creditCount++
        } else {
            totalSalesCash += amount
            countSalesCash++
            weeklySales[weekKey].cashAmount += amount
            weeklySales[weekKey].cashCount++
        }
        weeklySales[weekKey].totalAmount += amount
    })

    // Sort weeks? Usually object keys order is insertion order in modern JS but strictly maybe sort keys.
    const sortedWeeklySales = Object.entries(weeklySales).sort().map(([key, val]) => val)


    const totalSales = totalSalesCash + totalSalesCredit
    const stockValue = stockValueResponse.data?.reduce((acc, curr) => acc + Number(curr.list_price), 0) || 0
    const totalPortfolio = portfolioResponse.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    // Calculate Overdue Metrics
    const overdueInstallments = overdueResponse.data || []
    const overdueAmount = overdueInstallments.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const overdueCount = overdueInstallments.length

    // Calculate Average Days Overdue
    let totalDaysOverdue = 0
    overdueInstallments.forEach(inst => {
        const due = new Date(inst.due_date)
        const diffTime = Math.abs(now.getTime() - due.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        totalDaysOverdue += diffDays
    })
    const averageDaysOverdue = overdueCount > 0 ? Math.round(totalDaysOverdue / overdueCount) : 0

    const projectedCollections = projectedCollectionsResponse.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    const delinquencyRate = totalPortfolio > 0 ? (overdueAmount / totalPortfolio) * 100 : 0

    // Group Upcoming Maturities by Week
    interface MaturityWeeklyMetric {
        weekLabel: string;
        count: number;
        amount: number;
        details: any[];
    }
    const weeklyMaturities: Record<string, MaturityWeeklyMetric> = {}

    upcomingMaturitiesResponse.data?.forEach((inst: any) => {
        const date = new Date(inst.due_date)
        const weekKey = getWeekKey(date)

        if (!weeklyMaturities[weekKey]) {
            weeklyMaturities[weekKey] = { weekLabel: weekKey, count: 0, amount: 0, details: [] }
        }

        weeklyMaturities[weekKey].count++
        weeklyMaturities[weekKey].amount += Number(inst.amount)
        weeklyMaturities[weekKey].details.push(inst)
    })

    const sortedWeeklyMaturities = Object.entries(weeklyMaturities).sort().map(([key, val]) => val)

    return {
        totalSales,
        totalSalesCash,
        totalSalesCredit,
        countSalesCash,
        countSalesCredit,
        sortedWeeklySales,

        clientsCount: clientsResponse.count || 0,
        vehiclesCount: vehiclesResponse.count || 0,
        stockValue,
        totalPortfolio,
        delinquencyRate,
        projectedCollections,
        overdueAmount,
        overdueCount,
        averageDaysOverdue,
        upcomingMaturities: upcomingMaturitiesResponse.data || [],
        sortedWeeklyMaturities, // New grouped data
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
        vehiclesCount,
        overdueAmount,
        overdueCount,
        averageDaysOverdue,
        totalSalesCash,
        totalSalesCredit,
        countSalesCash,
        countSalesCredit,
        sortedWeeklySales,
        sortedWeeklyMaturities
    } = await getDashboardData()

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* KPI Principales */}
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
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                                <span>Contado ({countSalesCash}):</span>
                                <span className="font-semibold text-green-600">{formatCurrency(totalSalesCash)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Crédito ({countSalesCredit}):</span>
                                <span className="font-semibold text-blue-600">{formatCurrency(totalSalesCredit)}</span>
                            </div>
                        </div>
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
                        <CardTitle className="text-sm font-medium">Morosidad Global</CardTitle>
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

            {/* Sales Weekly Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Resumen Semanal de Ventas (Mes Actual)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sortedWeeklySales.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No hay ventas registradas este mes.</p>
                        ) : (
                            <div className="space-y-4">
                                {sortedWeeklySales.map((week, idx) => (
                                    <div key={idx} className="border rounded p-3 text-sm">
                                        <div className="flex justify-between font-semibold mb-2">
                                            <span>{week.label}</span>
                                            <span>{formatCurrency(week.totalAmount)}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                                <p className="text-green-700 dark:text-green-300 font-medium">Contado</p>
                                                <div className="flex justify-between mt-1 text-green-900 dark:text-green-100">
                                                    <span>Cant: {week.cashCount}</span>
                                                    <span>{formatCurrency(week.cashAmount)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                                                <p className="text-blue-700 dark:text-blue-300 font-medium">Crédito</p>
                                                <div className="flex justify-between mt-1 text-blue-900 dark:text-blue-100">
                                                    <span>Cant: {week.creditCount}</span>
                                                    <span>{formatCurrency(week.creditAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detalles de Mora (moved here for layout balance) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 col-span-2 md:col-span-1">
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monto Total en Mora</CardTitle>
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
                            <p className="text-xs text-muted-foreground">Sumatoria de cuotas vencidas</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cuotas en Mora</CardTitle>
                            <div className="h-4 w-4 font-bold text-orange-500">#</div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
                            <p className="text-xs text-muted-foreground">Cantidad de cuotas pendientes</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500 col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Días Promedio de Mora</CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{averageDaysOverdue} días</div>
                            <p className="text-xs text-muted-foreground">Promedio general</p>
                        </CardContent>
                    </Card>
                </div>


                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Próximos Vencimientos (Agrupado por Semana)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {sortedWeeklyMaturities.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay vencimientos próximos</p>
                                ) : (
                                    sortedWeeklyMaturities.map((group, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                                <span className="font-semibold text-sm">{group.weekLabel}</span>
                                                <div className="flex gap-4 text-xs font-medium">
                                                    <span>{group.count} cuotas</span>
                                                    <span>Total: {formatCurrency(group.amount)}</span>
                                                </div>
                                            </div>
                                            <div className="pl-2 space-y-2 border-l-2 ml-2">
                                                {group.details.map((inst: any) => (
                                                    <div className="flex items-center justify-between text-sm py-1" key={inst.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{inst.sales?.clients?.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Vence: {new Date(inst.due_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span>{formatCurrency(inst.amount)}</span>
                                                            <span className="text-[10px] text-muted-foreground block">
                                                                Cuota {inst.installment_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
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
                                {recentSales.map((sale: any) => (
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
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

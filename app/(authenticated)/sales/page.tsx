
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { formatCurrency } from "@/lib/utils"

export const dynamic = 'force-dynamic'

async function getSales() {
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

    const { data, error } = await supabase.from('sales').select(`
        *,
        clients:clients!sales_client_id_fkey ( name ),
        vehicles ( brand, model )
    `).order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching sales:", error);
    }

    return data || []
}

export default async function SalesPage() {
    const sales = await getSales()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
                <Link href="/sales/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Venta
                    </Button>
                </Link>
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Vehículo</TableHead>
                            <TableHead className="text-right">Entrega</TableHead>
                            <TableHead className="text-right">Saldo</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No hay ventas registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale: any) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{sale.clients?.name}</TableCell>
                                    <TableCell>{sale.vehicles?.brand} {sale.vehicles?.model}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.down_payment || 0)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.balance || 0)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(sale.total_amount || 0)}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/sales/${sale.id}`}>
                                            <Button variant="ghost" size="sm">Ver Plan</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

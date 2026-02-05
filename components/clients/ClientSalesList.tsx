'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Car, ChevronRight } from "lucide-react"
import Link from "next/link"

type Installment = {
    id: string
    number: number
    due_date: string
    amount: number
    status: string
    payment_date?: string
}

type BankAccount = {
    bank_name: string;
    account_number: string;
    currency: string;
}

type Payment = {
    id: string;
    installment_id: string | null;
    amount: number;
    payment_method: string;
    bank_accounts?: BankAccount;
    created_at: string;
}

type Vehicle = {
    brand: string
    model: string
    year: number
    plate?: string
    color?: string
}

type Sale = {
    id: string
    sale_date: string
    total_amount: number
    down_payment: number
    balance: number
    vehicles: Vehicle
    installments: Installment[]
    payments?: Payment[]
}

export function ClientSalesList({ sales }: { sales: Sale[] }) {
    if (sales.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No hay ventas registradas para este cliente.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Historial de Compras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sales.map(sale => (
                    <Link
                        key={sale.id}
                        href={`/sales/${sale.id}`}
                        className="block group"
                    >
                        <div className="p-4 border rounded-lg transition-all hover:bg-muted/50 hover:border-primary/50 relative">
                            <div className="absolute top-4 right-4 text-muted-foreground group-hover:text-primary transition-colors">
                                <ChevronRight className="h-5 w-5" />
                            </div>

                            <div className="flex items-start justify-between mb-2 pr-8">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Car className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{sale.vehicles.brand} {sale.vehicles.model}</h4>
                                        <p className="text-xs text-muted-foreground">{sale.vehicles.year} • {sale.vehicles.plate || 'S/Chapa'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha Venta</p>
                                    <Badge variant="outline" className="mt-1">{new Date(sale.sale_date).toLocaleDateString()}</Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
                                    <p className="font-bold text-primary">{formatCurrency(sale.balance)}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}

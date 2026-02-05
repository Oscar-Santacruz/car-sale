'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Car, Calendar, DollarSign, ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react"

type Installment = {
    id: string
    number: number
    due_date: string
    amount: number
    status: string
    payment_date?: string
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
}

export function ClientSalesList({ sales }: { sales: Sale[] }) {
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

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
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Sales List */}
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sales.map(sale => (
                        <div
                            key={sale.id}
                            onClick={() => setSelectedSale(sale)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedSale?.id === sale.id ? 'bg-muted border-primary' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Car className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{sale.vehicles.brand} {sale.vehicles.model}</h4>
                                        <p className="text-xs text-muted-foreground">{sale.vehicles.year} • {sale.vehicles.plate || 'S/Chapa'}</p>
                                    </div>
                                </div>
                                <Badge variant="outline">{new Date(sale.sale_date).toLocaleDateString()}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="text-muted-foreground">Precio Venta:</div>
                                <div className="font-medium">{formatCurrency(sale.total_amount)}</div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="text-muted-foreground">Saldo Actual:</div>
                                <div className="font-bold text-primary">{formatCurrency(sale.balance)}</div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Sale Details */}
            {selectedSale ? (
                <Card className="lg:row-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Plan de Pagos
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {selectedSale.vehicles.brand} {selectedSale.vehicles.model}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground">Precio Total</p>
                                <p className="font-medium">{formatCurrency(selectedSale.total_amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Entrega Inicial</p>
                                <p className="font-medium">{formatCurrency(selectedSale.down_payment)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo a Financiar</p>
                                <p className="font-medium">{formatCurrency(selectedSale.total_amount - selectedSale.down_payment)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
                                <p className="font-bold text-primary">{formatCurrency(selectedSale.balance)}</p>
                            </div>
                        </div>

                        <h4 className="font-medium mb-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Cuotas
                        </h4>

                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedSale.installments.sort((a, b) => a.number - b.number).map((inst) => {
                                        const isPaid = inst.status === 'paid'
                                        const isOverdue = !isPaid && new Date(inst.due_date) < new Date()

                                        return (
                                            <TableRow key={inst.id} className={isPaid ? "bg-green-50/50" : ""}>
                                                <TableCell className="font-medium">{inst.number}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{new Date(inst.due_date).toLocaleDateString()}</span>
                                                        {isPaid && inst.payment_date && (
                                                            <span className="text-[10px] text-green-600">
                                                                Pagado: {new Date(inst.payment_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">{formatCurrency(inst.amount)}</TableCell>
                                                <TableCell className="text-center">
                                                    {isPaid ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                            Pagado
                                                        </Badge>
                                                    ) : isOverdue ? (
                                                        <Badge variant="destructive">Vencido</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Pendiente</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground h-[400px]">
                    <Car className="h-12 w-12 mb-4 opacity-50" />
                    <p>Seleccione una venta para ver el plan de pagos</p>
                </div>
            )}
        </div>
    )
}

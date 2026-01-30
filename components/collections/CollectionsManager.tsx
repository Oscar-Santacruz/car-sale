'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, CreditCard, User, Calendar, CheckCircle, Wallet, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { getClientPendingInstallments, processPayment } from "@/app/collection-actions"

type Client = {
    id: string
    name: string
    ci: string
    email?: string
    phone?: string
}

type Installment = {
    id: string
    installment_number: number
    amount: number
    due_date: string
    status: string
    sales: {
        id: string
        vehicles: {
            brand: string
            model: string
            year: number
            plate: string
        }
    }
}

export function CollectionsManager({ clients }: { clients: Client[] }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [installments, setInstallments] = useState<Installment[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Payment State
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null)
    const [paymentAmount, setPaymentAmount] = useState<number>(0)
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Filter clients
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ci.includes(searchTerm)
    )

    // Load installments when client selected
    useEffect(() => {
        if (selectedClient) {
            loadInstallments(selectedClient.id)
        } else {
            setInstallments([])
        }
    }, [selectedClient])

    const loadInstallments = async (clientId: string) => {
        setIsLoading(true)
        try {
            const data = await getClientPendingInstallments(clientId) as any
            setInstallments(data)
        } catch (error) {
            console.error(error)
            alert("Error al cargar cuotas")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenPayment = (inst: Installment) => {
        setSelectedInstallment(inst)
        setPaymentAmount(inst.amount) // Default to full amount
        setPaymentMethod("cash")
        setIsSheetOpen(true)
    }

    const handleProcessPayment = async () => {
        if (!selectedInstallment) return

        setIsProcessing(true)
        try {
            await processPayment({
                installmentId: selectedInstallment.id,
                amount: paymentAmount,
                paymentMethod,
                referenceNumber: ""
            })
            setIsSheetOpen(false)
            // Reload
            if (selectedClient) loadInstallments(selectedClient.id)
            alert("Pago procesado correctamente")
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-12 h-[calc(100vh-120px)]">
            {/* Left Col: Client Search */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Buscar Cliente</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Nombre o CI..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <div className="flex flex-col">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`flex items-start gap-3 p-4 text-left border-b hover:bg-muted/50 transition-colors ${selectedClient?.id === client.id ? 'bg-muted border-l-4 border-l-primary' : ''}`}
                                >
                                    <div className="rounded-full bg-primary/10 p-2 text-primary mt-1">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-sm text-muted-foreground">CI: {client.ci}</div>
                                    </div>
                                </button>
                            ))}
                            {filteredClients.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No se encontraron clientes
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Col: Details */}
            <div className="lg:col-span-8 flex flex-col gap-4">
                {selectedClient ? (
                    <>
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                                        {selectedClient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                                        <p className="text-muted-foreground">CI: {selectedClient.ci}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Cuotas Pendientes</div>
                                    <div className="text-2xl font-bold text-primary">{installments.length}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 flex flex-col">
                            <CardHeader>
                                <CardTitle>Cuotas Pendientes de Pago</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto">
                                {isLoading ? (
                                    <div className="p-8 text-center">Cargando cuotas...</div>
                                ) : installments.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                        <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                                        <p>Este cliente está al día. No tiene cuotas pendientes.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Vencimiento</TableHead>
                                                <TableHead>Concepto</TableHead>
                                                <TableHead>Cuota #</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {installments.map(inst => (
                                                <TableRow key={inst.id}>
                                                    <TableCell className="font-medium">
                                                        {new Date(inst.due_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {inst.sales?.vehicles?.brand} {inst.sales?.vehicles?.model}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {inst.sales?.vehicles?.plate}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                                                            {inst.installment_number}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-lg">
                                                        {formatCurrency(inst.amount)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" onClick={() => handleOpenPayment(inst)}>
                                                            <Wallet className="w-4 h-4 mr-2" />
                                                            Cobrar
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground p-12">
                        <User className="h-16 w-16 mb-4 opacity-50" />
                        <h3 className="text-xl font-medium">Seleccione un Cliente</h3>
                        <p>Busque y seleccione un cliente para ver su estado de cuenta.</p>
                    </div>
                )}
            </div>

            {/* Payment Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Registrar Cobro</SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Ingrese los detalles del pago recibido.
                        </p>
                    </SheetHeader>

                    {selectedInstallment && (
                        <div className="space-y-6 py-6">
                            <div className="rounded-lg bg-muted p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cuota N°:</span>
                                    <span className="font-medium">{selectedInstallment.installment_number}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vencimiento:</span>
                                    <span className="font-medium">{new Date(selectedInstallment.due_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vehículo:</span>
                                    <span className="font-medium">{selectedInstallment.sales?.vehicles?.model}</span>
                                </div>
                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="font-semibold">Monto Total:</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(selectedInstallment.amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Monto a Cobrar (Gs.)</Label>
                                <Input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                    className="text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Método de Pago</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="cash">Efectivo</option>
                                    <option value="transfer">Transferencia</option>
                                    <option value="check">Cheque</option>
                                    <option value="pos">Tarjeta (POS)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
                        <Button onClick={handleProcessPayment} disabled={isProcessing}>
                            {isProcessing ? "Procesando..." : "Confirmar Cobro"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

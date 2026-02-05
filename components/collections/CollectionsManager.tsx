'use client'

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, CreditCard, User, Calendar, CheckCircle, Wallet, FileText, Filter, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { getClientPendingInstallments, processPayment, type ClientSummary } from "@/app/collection-actions"
import { Receipt } from "./Receipt"
import { CollectionsToolbar, FilterPeriod } from "./CollectionsToolbar"
import { ClientResultsList } from "./ClientResultsList"
import { DateRange } from "react-day-picker"

type Installment = {
    id: string
    number: number
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

export function CollectionsManager({ clients, settings, bankAccounts = [] }: { clients: ClientSummary[], settings?: any, bankAccounts?: any[] }) {
    // Filter State
    const [searchTerm, setSearchTerm] = useState("")
    const [period, setPeriod] = useState<FilterPeriod>('all')
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    // UI State
    const [filteredClients, setFilteredClients] = useState<ClientSummary[]>(clients)
    const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null)
    const [installments, setInstallments] = useState<Installment[]>([])
    const [isLoadingInstallments, setIsLoadingInstallments] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    // Payment State
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null)
    const [paymentAmount, setPaymentAmount] = useState<number>(0)
    const [penaltyAmount, setPenaltyAmount] = useState<number>(0)
    const [comment, setComment] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [selectedBankAccount, setSelectedBankAccount] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false)

    // Receipt State
    const [lastPayment, setLastPayment] = useState<any>(null)
    const receiptRef = useRef<HTMLDivElement>(null)

    // Filter Logic
    useEffect(() => {
        let result = clients

        // 1. Search Text
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase()
            result = result.filter(c =>
                c.name.toLowerCase().includes(lowerQuery) ||
                c.ci.includes(searchTerm)
            )
        }

        // 2. Period Logic
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (period !== 'all' || dateRange?.from) {
            result = result.filter(c => {
                if (!c.nearestDueDate) return false
                const due = new Date(c.nearestDueDate)
                due.setHours(0, 0, 0, 0)

                // Date Range Strategy
                if (dateRange?.from) {
                    const from = dateRange.from
                    const to = dateRange.to || dateRange.from
                    return due >= from && due <= to
                }

                // Preset Periods
                if (period === 'today') {
                    return due.getTime() <= today.getTime()
                }
                if (period === 'week') {
                    const endOfWeek = new Date(today)
                    endOfWeek.setDate(today.getDate() + 7)
                    return due <= endOfWeek
                }
                if (period === 'month') {
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                    return due <= endOfMonth
                }
                return true
            })
        }

        setFilteredClients(result)
    }, [clients, searchTerm, period, dateRange])


    // Load Details
    useEffect(() => {
        if (selectedClient) {
            loadInstallments(selectedClient.id)
            setIsDetailsOpen(true)
        }
    }, [selectedClient])

    const loadInstallments = async (clientId: string) => {
        setIsLoadingInstallments(true)
        try {
            const data = await getClientPendingInstallments(clientId) as any
            setInstallments(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoadingInstallments(false)
        }
    }

    const handleSelectClient = (clientId: string) => {
        const client = clients.find(c => c.id === clientId) || null
        setSelectedClient(client)
    }

    const calculatePenalty = (inst: Installment) => {
        if (!settings) return 0
        const dueDate = new Date(inst.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        const diffTime = today.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // If overdue
        if (diffDays > 0) {
            // Check grace period
            const grace = settings.penalty_grace_days || 0
            if (diffDays > grace) {
                return Number(settings.default_penalty_amount || 0)
            }
        }
        return 0
    }

    const handleOpenPayment = (inst: Installment) => {
        setSelectedInstallment(inst)

        const calcPenalty = calculatePenalty(inst)
        setPenaltyAmount(calcPenalty)
        setPaymentAmount(inst.amount + calcPenalty)
        setComment("")
        setPaymentMethod("cash")
        setSelectedBankAccount("")
        setIsPaymentSheetOpen(true)
    }

    const handlePrint = () => {
        const content = receiptRef.current
        if (!content) return

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Recibo</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @page { size: auto; margin: 0mm; }
                            body { margin: 20mm; }
                        </style>
                    </head>
                    <body>
                        ${content.outerHTML}
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.focus()
            setTimeout(() => {
                printWindow.print()
                printWindow.close()
            }, 500)
        }
    }

    const handleProcessPayment = async () => {
        if (!selectedInstallment || !selectedClient) return

        setIsProcessing(true)
        try {
            const result = await processPayment({
                installmentId: selectedInstallment.id,
                saleId: selectedInstallment.sales.id,
                amount: paymentAmount,
                paymentMethod,
                referenceNumber: "",
                penaltyAmount,
                comment,
                bankAccountId: paymentMethod === 'transfer' ? selectedBankAccount : undefined
            }) as any

            setIsPaymentSheetOpen(false)
            setLastPayment({
                data: result.payment,
                installment: selectedInstallment,
                client: selectedClient
            })

            // Reload installments
            await loadInstallments(selectedClient.id)

        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4">

            {/* Toolbar */}
            <CollectionsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                period={period}
                onPeriodChange={setPeriod}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />

            {/* Results */}
            <div className="flex-1 overflow-auto">
                <ClientResultsList
                    clients={filteredClients}
                    onSelectClient={handleSelectClient}
                />
            </div>

            {/* Details Sheet */}
            <Sheet open={isDetailsOpen} onOpenChange={(open) => {
                setIsDetailsOpen(open)
                if (!open) setSelectedClient(null)
            }}>
                <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Estado de Cuenta
                        </SheetTitle>
                        {selectedClient && (
                            <SheetDescription>
                                {selectedClient.name} - CI: {selectedClient.ci}
                            </SheetDescription>
                        )}
                    </SheetHeader>

                    {isLoadingInstallments ? (
                        <div className="text-center py-8">Cargando cuotas...</div>
                    ) : (
                        <div className="space-y-6">
                            {installments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                    No hay cuotas pendientes.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {installments.map(inst => {
                                        const isOverdue = new Date(inst.due_date) < new Date()
                                        return (
                                            <Card key={inst.id} className={`overflow-hidden ${isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`}>
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="text-xs font-bold px-2 py-0.5 rounded bg-muted">Cuota {inst.number}</div>
                                                            <div className="text-sm text-muted-foreground">{new Date(inst.due_date).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="font-medium text-sm">
                                                            {inst.sales.vehicles.brand} {inst.sales.vehicles.model}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="font-bold text-lg">{formatCurrency(inst.amount)}</div>
                                                        <Button size="sm" onClick={() => handleOpenPayment(inst)}>
                                                            <Wallet className="h-4 w-4 mr-1" /> Cobrar
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Payment Sheet */}
            <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Registrar Cobro</SheetTitle>
                        <SheetDescription>Ingrese los detalles del pago.</SheetDescription>
                    </SheetHeader>
                    {selectedInstallment && (
                        <div className="space-y-6 py-6">
                            {/* Same payment form grid ... */}
                            <div className="rounded-lg bg-muted p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cuota N°:</span>
                                    <span className="font-medium">{selectedInstallment.number}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vencimiento:</span>
                                    <span className="font-medium">{new Date(selectedInstallment.due_date).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="font-semibold">Importe Cuota:</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(selectedInstallment.amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Multa / Interés (Gs.)</Label>
                                    <Input
                                        type="text"
                                        value={new Intl.NumberFormat('es-PY').format(penaltyAmount)}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, '')
                                            const val = rawValue === '' ? 0 : Number(rawValue)
                                            setPenaltyAmount(val)
                                            setPaymentAmount(selectedInstallment.amount + val)
                                        }}
                                        className="text-right"
                                    />
                                    {settings?.penalty_grace_days > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            GD: {settings.penalty_grace_days} días.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Monto Total a Cobrar (Gs.)</Label>
                                    <Input
                                        type="text"
                                        value={new Intl.NumberFormat('es-PY').format(paymentAmount)}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, '')
                                            setPaymentAmount(rawValue === '' ? 0 : Number(rawValue))
                                        }}
                                        className="text-lg font-bold text-right"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Comentarios</Label>
                                    <Input
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Opcional..."
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

                                {paymentMethod === 'transfer' && (
                                    <div className="space-y-2">
                                        <Label>Cuenta Bancaria Destino</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={selectedBankAccount}
                                            onChange={(e) => setSelectedBankAccount(e.target.value)}
                                        >
                                            <option value="">Seleccione una cuenta...</option>
                                            {bankAccounts.map((acc: any) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.bank_name} - {acc.account_number} ({acc.currency})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <Button onClick={handleProcessPayment} disabled={isProcessing || (paymentMethod === 'transfer' && !selectedBankAccount)} className="w-full">
                                {isProcessing ? "Procesando..." : "Confirmar Cobro"}
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Success Modal / Print */}
            <Sheet open={!!lastPayment} onOpenChange={(open) => !open && setLastPayment(null)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Pago Exitoso</SheetTitle>
                    </SheetHeader>
                    <div className="py-6 flex flex-col gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center text-green-700">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                            <p className="font-bold">Pago Registrado</p>
                            <p className="text-sm">Recibo N° {lastPayment?.data?.receipt_number}</p>
                        </div>
                        <Button onClick={handlePrint} className="w-full">
                            <FileText className="mr-2 h-4 w-4" /> Imprimir Recibo
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Hidden Receipt */}
            <div className="hidden">
                {lastPayment && (
                    <Receipt
                        ref={receiptRef}
                        payment={lastPayment.data}
                        client={lastPayment.client}
                        sale={{
                            vehicle_brand: lastPayment.installment.sales.vehicles.brand,
                            vehicle_model: lastPayment.installment.sales.vehicles.model,
                            vehicle_plate: lastPayment.installment.sales.vehicles.plate
                        }}
                        installmentNumber={lastPayment.installment.number}
                    />
                )}
            </div>
        </div >
    )
}

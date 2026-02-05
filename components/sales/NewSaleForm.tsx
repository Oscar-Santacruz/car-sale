'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateAmortizationSchedule } from "@/lib/financing"
import { Trash2, Plus } from "lucide-react"
import { createSaleAction } from "@/app/sales-actions"

type Client = {
    id: string;
    name: string;
    ci: string;
}

type Vehicle = {
    id: string;
    brand: string;
    model: string;
    year: number;
    list_price: number;
    // ... other fields
}

type BankAccount = {
    id: string;
    bank_name: string;
    account_number: string;
    currency: string;
}

export function NewSaleForm({ clients, vehicles, bankAccounts = [] }: { clients: Client[], vehicles: Vehicle[], bankAccounts?: BankAccount[] }) {
    const [clientId, setClientId] = React.useState("")
    const [codeudorId, setCodeudorId] = React.useState("")
    const [vehicleId, setVehicleId] = React.useState("")

    // Financial Params
    const [price, setPrice] = React.useState(0)
    const [downPayment, setDownPayment] = React.useState(0)
    const [months, setMonths] = React.useState(12)
    const [interestRate, setInterestRate] = React.useState(0)
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0])

    const [refuerzos, setRefuerzos] = React.useState<{ monthIndex: number, amount: number }[]>([])
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [paymentType, setPaymentType] = React.useState<'contado' | 'cuotas'>('contado')

    // Initial Payment Details
    const [initialPaymentMethod, setInitialPaymentMethod] = React.useState('cash')
    const [selectedBankAccountId, setSelectedBankAccountId] = React.useState("")

    // Handlers
    const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vId = e.target.value
        setVehicleId(vId)
        const vehicle = vehicles.find(v => v.id === vId)
        if (vehicle) {
            setPrice(vehicle.list_price)
            setDownPayment(vehicle.list_price * 0.2) // Default 20% down
        }
    }

    // Update downPayment automatically if Cash is selected
    React.useEffect(() => {
        if (paymentType === 'contado') {
            setDownPayment(price)
            setMonths(1)
            setInterestRate(0)
            setRefuerzos([])
        } else {
            // Reset to defaults for installments if switching back
            setDownPayment(price * 0.2)
            setMonths(12)
        }
    }, [paymentType, price])

    const addRefuerzo = () => {
        setRefuerzos([...refuerzos, { monthIndex: 6, amount: 0 }])
    }

    const updateRefuerzo = (index: number, field: 'monthIndex' | 'amount', value: number) => {
        const newRefuerzos = [...refuerzos]
        newRefuerzos[index] = { ...newRefuerzos[index], [field]: value }
        setRefuerzos(newRefuerzos)
    }

    const removeRefuerzo = (index: number) => {
        setRefuerzos(refuerzos.filter((_, i) => i !== index))
    }

    // Derived State
    const balance = Math.max(0, price - downPayment)

    const schedule = React.useMemo(() => {
        if (balance <= 0 || months <= 0) return []
        return calculateAmortizationSchedule(
            balance,
            months,
            interestRate,
            new Date(startDate),
            refuerzos
        )
    }, [balance, months, interestRate, startDate, refuerzos])

    const handleSave = async () => {
        if (!clientId || !vehicleId) {
            alert("Seleccione cliente y vehículo")
            return
        }
        setIsSubmitting(true)
        try {
            await createSaleAction({
                clientId,
                codeudorId, // Pass codeudor
                vehicleId,
                price,
                downPayment,
                months,
                interestRate,
                startDate,
                refuerzos,
                // Payment Details
                paymentMethod: initialPaymentMethod,
                bankAccountId: initialPaymentMethod === 'transfer' ? selectedBankAccountId : undefined
            })
        } catch (e: any) {
            if (e.message === 'NEXT_REDIRECT' || e.message.includes('NEXT_REDIRECT')) {
                return; // Redirecting...
            }
            alert("Error: " + e.message)
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT COLUMN: Inputs */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Datos de la Operación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cliente <span className="text-red-500">*</span></Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={clientId}
                                onChange={(e) => {
                                    setClientId(e.target.value)
                                    if (e.target.value === codeudorId) setCodeudorId("") // Prevent same client
                                }}
                            >
                                <option value="">Seleccionar Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.ci}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Codeudor (Opcional)</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={codeudorId}
                                onChange={(e) => setCodeudorId(e.target.value)}
                            >
                                <option value="">Sin Codeudor</option>
                                {clients
                                    .filter(c => c.id !== clientId) // Exclude selected client
                                    .map(c => <option key={c.id} value={c.id}>{c.name} - {c.ci}</option>)
                                }
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Venta <span className="text-red-500">*</span></Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value as 'contado' | 'cuotas')}
                            >
                                <option value="contado">Al Contado</option>
                                <option value="cuotas">A Cuotas / Financiado</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Vehículo <span className="text-red-500">*</span></Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={vehicleId}
                                onChange={handleVehicleChange}
                            >
                                <option value="">Seleccionar Vehículo</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.brand} {v.model} {v.year} - Gs. {v.list_price.toLocaleString('es-PY')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Precio Venta (Gs.) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={price > 0 ? price.toLocaleString('es-PY') : ''}
                                    onChange={(e) => {
                                        const val = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''))
                                        setPrice(isNaN(val) ? 0 : val)
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Entrega Inicial (Gs.) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={downPayment > 0 ? downPayment.toLocaleString('es-PY') : ''}
                                    onChange={(e) => {
                                        const val = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''))
                                        setDownPayment(isNaN(val) ? 0 : val)
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-md bg-muted p-4">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Saldo a Financiar:</span>
                                <span className="text-xl font-bold">Gs. {balance.toLocaleString('es-PY')}</span>
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="border-t pt-4">
                            <Label className="mb-2 block font-semibold">Detalles del Pago Inicial (Entrega / Contado)</Label>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Forma de Pago</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={initialPaymentMethod}
                                        onChange={(e) => setInitialPaymentMethod(e.target.value)}
                                    >
                                        <option value="cash">Efectivo</option>
                                        <option value="transfer">Transferencia Bancaria</option>
                                        <option value="check">Cheque</option>
                                        <option value="pos">Tarjeta (POS)</option>
                                    </select>
                                </div>

                                {initialPaymentMethod === 'transfer' && (
                                    <div className="space-y-2">
                                        <Label>Cuenta Bancaria Destino <span className="text-red-500">*</span></Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={selectedBankAccountId}
                                            onChange={(e) => setSelectedBankAccountId(e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccione cuenta...</option>
                                            {bankAccounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.bank_name} - {acc.account_number} ({acc.currency})
                                                </option>
                                            ))}
                                        </select>
                                        {bankAccounts.length === 0 && (
                                            <p className="text-xs text-red-500">No hay cuentas bancarias activas.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>



                {
                    paymentType === 'cuotas' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuración de Plan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Plazo (Meses)</Label>
                                        <Input
                                            type="number"
                                            value={months}
                                            onChange={(e) => setMonths(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Interés Anual (%)</Label>
                                        <Input
                                            type="number"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Primer Venc. <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Refuerzos (Pagos Extra)</Label>
                                        <Button size="sm" variant="outline" onClick={addRefuerzo} type="button">
                                            <Plus className="h-4 w-4 mr-2" /> Agregar
                                        </Button>
                                    </div>
                                    {refuerzos.map((r, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-24">
                                                <span className="text-xs text-muted-foreground mr-1">Mes #</span>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={r.monthIndex}
                                                    onChange={(e) => updateRefuerzo(idx, 'monthIndex', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-muted-foreground mr-1">Monto Gs.</span>
                                                <Input
                                                    type="text"
                                                    className="h-8"
                                                    value={r.amount > 0 ? r.amount.toLocaleString('es-PY') : ''}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''))
                                                        updateRefuerzo(idx, 'amount', isNaN(val) ? 0 : val)
                                                    }}
                                                />
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeRefuerzo(idx)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    {refuerzos.length === 0 && (
                                        <p className="text-xs text-muted-foreground">Sin refuerzos cargados.</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>

                            </CardFooter>
                        </Card>
                    )
                }

                <Button className="w-full" size="lg" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Venta'}
                </Button>
            </div >

            {/* RIGHT COLUMN: Schedule */}
            {
                paymentType === 'cuotas' && (
                    <div className="space-y-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Tabla de Amortización (Proyección)</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto max-h-[600px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Vencimiento</TableHead>
                                            <TableHead className="text-right">Cuota</TableHead>
                                            <TableHead className="text-right">Capital</TableHead>
                                            <TableHead className="text-right">Int.</TableHead>
                                            <TableHead className="text-right">Saldo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schedule.map((row) => (
                                            <TableRow key={row.paymentNumber} className={row.isRefuerzo ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}>
                                                <TableCell className="font-medium">{row.paymentNumber}</TableCell>
                                                <TableCell>{row.dueDate.toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right font-bold">
                                                    Gs. {row.installmentAmount.toLocaleString('es-PY')}
                                                    {row.isRefuerzo && <span className="ml-1 text-[10px] text-muted-foreground">(Ref)</span>}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">Gs. {row.capital.toLocaleString('es-PY')}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">Gs. {row.interest.toLocaleString('es-PY')}</TableCell>
                                                <TableCell className="text-right">Gs. {row.balance.toLocaleString('es-PY')}</TableCell>
                                            </TableRow>
                                        ))}
                                        {schedule.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                    Configure los parámetros para calcular.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                    </div >
                )
            }
        </div >
    )
}

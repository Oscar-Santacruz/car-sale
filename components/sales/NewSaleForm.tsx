'use client'

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateAmortizationSchedule } from "@/lib/financing"
import { Trash2, Plus } from "lucide-react"
import { createSaleAction } from "@/app/sales-actions"
import { getVehiclePaymentPlansAction } from "@/app/vehicle-payment-plan-actions"
import { DatePicker } from "@/components/ui/date-picker"

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

    // Default start date (First Payment) to 1 month from today
    const defaultStartDate = new Date()
    defaultStartDate.setMonth(defaultStartDate.getMonth() + 1)
    const [startDate, setStartDate] = React.useState(defaultStartDate.toISOString().split('T')[0])

    const [refuerzos, setRefuerzos] = React.useState<{ date: string, amount: number }[]>([])
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [paymentType, setPaymentType] = React.useState<'contado' | 'cuotas'>('contado')
    const [paymentPlans, setPaymentPlans] = React.useState<any[]>([])
    const [selectedPlanId, setSelectedPlanId] = React.useState("")

    // Initial Payment Details
    const [initialPaymentMethod, setInitialPaymentMethod] = React.useState('cash')
    const [selectedBankAccountId, setSelectedBankAccountId] = React.useState("")

    // Handlers
    const handleVehicleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vId = e.target.value
        setVehicleId(vId)
        const vehicle = vehicles.find(v => v.id === vId)
        if (vehicle) {
            setPrice(vehicle.list_price)
            setDownPayment(vehicle.list_price * 0.2) // Default 20% down
        }
        // Fetch payment plans for this vehicle
        if (vId) {
            const plans = await getVehiclePaymentPlansAction(vId)
            setPaymentPlans(plans)
            setSelectedPlanId("") // Reset selection
        } else {
            setPaymentPlans([])
        }
    }

    const handleLoadPaymentPlan = () => {
        const plan = paymentPlans.find(p => p.id === selectedPlanId)
        if (!plan) return

        setMonths(plan.months)
        setInterestRate(plan.annual_interest_rate)

        // Set down payment based on plan suggestion
        if (plan.suggested_down_payment) {
            setDownPayment(plan.suggested_down_payment)
        } else if (plan.suggested_down_payment_percentage) {
            setDownPayment(price * (plan.suggested_down_payment_percentage / 100))
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
        // Default to 6 months from now
        const d = new Date()
        d.setMonth(d.getMonth() + 6)
        setRefuerzos([...refuerzos, { date: d.toISOString().split('T')[0], amount: 0 }])
    }

    const updateRefuerzo = (index: number, field: 'date' | 'amount', value: any) => {
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
            toast.warning("Seleccione cliente y vehículo")
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
            toast.error("Error: " + e.message)
            setIsSubmitting(false)
        }
    }

    return (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
                                        {v.brand} {v.model} {v.year} - Gs. {v.list_price.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <span className="text-xl font-bold">Gs. {balance.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>

                        {/* Payment Plan Template Selector */}
                        {paymentType === 'cuotas' && paymentPlans.length > 0 && (
                            <div className="border rounded-md p-4 bg-blue-50 dark:bg-blue-950/20 space-y-3">
                                <Label className="font-semibold text-blue-900 dark:text-blue-100">Cargar Plan Predefinido</Label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={selectedPlanId}
                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                    >
                                        <option value="">Seleccionar plan...</option>
                                        {paymentPlans.map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} ({plan.months} meses, {plan.annual_interest_rate}% interés)
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleLoadPaymentPlan}
                                        disabled={!selectedPlanId}
                                    >
                                        Cargar
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Selecciona un plan para auto-completar los campos de financiamiento. Puedes personalizar después.
                                </p>
                            </div>
                        )}

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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <DatePicker
                                            date={startDate ? new Date(startDate + 'T00:00:00') : undefined}
                                            setDate={(date) => setStartDate(date ? date.toISOString().split('T')[0] : "")}
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
                                            <div className="w-48">
                                                <span className="text-xs text-muted-foreground mr-1">Fecha</span>
                                                <DatePicker
                                                    size="sm"
                                                    date={r.date ? new Date(r.date + 'T00:00:00') : undefined}
                                                    setDate={(date) => updateRefuerzo(idx, 'date', date ? date.toISOString().split('T')[0] : "")}
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
                        {/* Summary Card */}
                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-blue-900 dark:text-blue-100">Resumen del Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Cuotas Summary */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Cuotas Mensuales</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">{months}</span>
                                            <span className="text-xs text-muted-foreground">x</span>
                                            <span className="text-xl font-bold text-primary">
                                                Gs. {schedule.find(s => !s.isRefuerzo)?.installmentAmount.toLocaleString('es-PY', { maximumFractionDigits: 0 }) || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Refuerzos Summary */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Refuerzos / Pagos Extra</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">{refuerzos.length}</span>
                                            <span className="text-xs text-muted-foreground">x</span>
                                            <span className="text-xl font-bold text-primary">
                                                Gs. {refuerzos.reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Total Refuerzos
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Tabla de Amortización (Proyección)</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-x-auto">
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
                                                    Gs. {row.installmentAmount.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                                    {row.isRefuerzo && <span className="ml-1 text-[10px] text-muted-foreground">(Ref)</span>}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">Gs. {row.capital.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">Gs. {row.interest.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</TableCell>
                                                <TableCell className="text-right">Gs. {row.balance.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</TableCell>
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

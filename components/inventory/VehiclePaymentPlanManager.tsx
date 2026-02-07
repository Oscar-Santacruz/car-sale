'use client'

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Star, ChevronDown, ChevronUp } from "lucide-react"
import { createPaymentPlanAction, updatePaymentPlanAction, deletePaymentPlanAction, PaymentPlanData } from "@/app/vehicle-payment-plan-actions"
import { generatePaymentSchedule, getScheduleSummary, Reinforcement, PaymentScheduleRow } from "@/lib/payment-calculator"

interface PaymentPlan extends PaymentPlanData {
    id?: string
}

interface VehiclePaymentPlanManagerProps {
    vehicleId?: string
    initialPlans?: PaymentPlan[]
    vehiclePrice?: number // List price for calculations
}

export function VehiclePaymentPlanManager({ vehicleId, initialPlans = [], vehiclePrice = 0 }: VehiclePaymentPlanManagerProps) {
    const [plans, setPlans] = useState<PaymentPlan[]>(initialPlans)
    const [newPlan, setNewPlan] = useState<PaymentPlanData>({
        name: "",
        months: 12,
        annual_interest_rate: 0,
        suggested_down_payment: undefined,
        suggested_down_payment_percentage: undefined,
        is_default: false
    })
    const [isSaving, setIsSaving] = useState(false)
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
    const [reinforcements, setReinforcements] = useState<Record<string, Reinforcement[]>>({})
    const [newReinforcement, setNewReinforcement] = useState<Record<string, { month: number, amount: number }>>({})

    const handleAddPlan = async () => {
        if (!newPlan.name || newPlan.months <= 0) {
            toast.warning("Por favor completa el nombre y los meses")
            return
        }

        if (!vehicleId) {
            // For new vehicles, just add to local state
            setPlans([...plans, { ...newPlan, id: `temp-${Date.now()}` }])
            setNewPlan({
                name: "",
                months: 12,
                annual_interest_rate: 0,
                suggested_down_payment: undefined,
                suggested_down_payment_percentage: undefined,
                is_default: false
            })
            return
        }

        setIsSaving(true)
        try {
            const result = await createPaymentPlanAction(vehicleId, newPlan)
            if (result.success) {
                setPlans([...plans, result.data])
                setNewPlan({
                    name: "",
                    months: 12,
                    annual_interest_rate: 0,
                    suggested_down_payment: undefined,
                    suggested_down_payment_percentage: undefined,
                    is_default: false
                })
            }
        } catch (error: any) {
            toast.error("Error al guardar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeletePlan = async (planId: string) => {
        if (!vehicleId || planId.startsWith('temp-')) {
            // For new vehicles or temp plans, just remove from local state
            setPlans(plans.filter(p => p.id !== planId))
            return
        }

        if (!confirm("¿Eliminar este plan de pago?")) return

        setIsSaving(true)
        try {
            await deletePaymentPlanAction(planId)
            setPlans(plans.filter(p => p.id !== planId))
        } catch (error: any) {
            toast.error("Error al eliminar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleToggleDefault = async (planId: string) => {
        if (!vehicleId || planId.startsWith('temp-')) {
            // For new vehicles, just update local state
            setPlans(plans.map(p => ({
                ...p,
                is_default: p.id === planId
            })))
            return
        }

        setIsSaving(true)
        try {
            await updatePaymentPlanAction(planId, { is_default: true })
            setPlans(plans.map(p => ({
                ...p,
                is_default: p.id === planId
            })))
        } catch (error: any) {
            toast.error("Error al actualizar: " + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleExpanded = (planId: string) => {
        setExpandedPlan(expandedPlan === planId ? null : planId)
    }

    const addReinforcement = (planId: string) => {
        const reinforcement = newReinforcement[planId]
        if (!reinforcement || !reinforcement.month || !reinforcement.amount) {
            toast.warning("Por favor completa el mes y monto del refuerzo")
            return
        }

        const currentReinforcements = reinforcements[planId] || []
        setReinforcements({
            ...reinforcements,
            [planId]: [...currentReinforcements, reinforcement].sort((a, b) => a.month - b.month)
        })

        // Clear input
        setNewReinforcement({
            ...newReinforcement,
            [planId]: { month: 1, amount: 0 }
        })
    }

    const removeReinforcement = (planId: string, index: number) => {
        const currentReinforcements = reinforcements[planId] || []
        setReinforcements({
            ...reinforcements,
            [planId]: currentReinforcements.filter((_, i) => i !== index)
        })
    }

    const calculateFinancedAmount = (plan: PaymentPlan) => {
        const downPayment = plan.suggested_down_payment ||
            (plan.suggested_down_payment_percentage ? vehiclePrice * plan.suggested_down_payment_percentage / 100 : 0)
        return vehiclePrice - downPayment
    }

    const getPaymentSchedule = (plan: PaymentPlan): PaymentScheduleRow[] => {
        const financedAmount = calculateFinancedAmount(plan)
        // detailed logic: check plan.reinforcements first (new style), then fall back to local state (old style or separate editing)
        // For 'newPlan' preview, it will have reinforcements in the object.
        const planReinforcements = plan.reinforcements || (plan.id ? reinforcements[plan.id] : []) || []
        return generatePaymentSchedule(financedAmount, plan.annual_interest_rate, plan.months, planReinforcements)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Planes de Pago Sugeridos</CardTitle>
                <CardDescription>
                    Define planes de financiamiento predeterminados para este vehículo
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Existing Plans */}
                {plans.length > 0 && (
                    <div className="space-y-2">
                        {plans.map((plan) => {
                            const isExpanded = expandedPlan === plan.id
                            const schedule = getPaymentSchedule(plan)
                            const summary = schedule.length > 0 ? getScheduleSummary(schedule) : null
                            const planReinforcements = plan.id ? reinforcements[plan.id] || [] : []

                            return (
                                <div key={plan.id} className="border rounded-lg">
                                    {/* Plan Header */}
                                    <div className="flex items-center gap-2 p-3 hover:bg-accent/50 cursor-pointer" onClick={() => plan.id && toggleExpanded(plan.id)}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                plan.id && handleToggleDefault(plan.id)
                                            }}
                                        >
                                            <Star className={`h-4 w-4 ${plan.is_default ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                        </Button>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div className="font-medium">{plan.name}</div>
                                            <div>{plan.months} meses</div>
                                            <div>{plan.annual_interest_rate}% anual</div>
                                            <div>
                                                {plan.suggested_down_payment
                                                    ? `Gs. ${plan.suggested_down_payment.toLocaleString('es-PY')}`
                                                    : plan.suggested_down_payment_percentage
                                                        ? `${plan.suggested_down_payment_percentage}%`
                                                        : 'Sin inicial'}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                plan.id && handleDeletePlan(plan.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && plan.id && (
                                        <div className="border-t p-4 space-y-4 bg-muted/30">
                                            {/* Summary */}
                                            {summary && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-background p-3 rounded-md border">
                                                    <div>
                                                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Plan de Cuotas</div>
                                                        <div className="flex items-baseline gap-2 mt-1">
                                                            <span className="text-xl font-bold">{plan.months}</span>
                                                            <span className="text-xs text-muted-foreground">cuotas de</span>
                                                            <span className="text-lg font-bold text-primary">Gs. {summary.monthlyPayment.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Refuerzos</div>
                                                        <div className="flex items-baseline gap-2 mt-1">
                                                            <span className="text-xl font-bold">{planReinforcements.length}</span>
                                                            <span className="text-xs text-muted-foreground">total</span>
                                                            <span className="text-lg font-bold text-primary">
                                                                Gs. {planReinforcements.reduce((acc, r) => acc + r.amount, 0).toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t mt-1">
                                                        <div>
                                                            <div className="text-muted-foreground">Total Financiado + Intereses</div>
                                                            <div className="font-semibold">Gs. {summary.totalPaid.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground">Intereses Generados</div>
                                                            <div className="font-semibold">Gs. {summary.totalInterest.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reinforcements */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-sm">Refuerzos</h4>
                                                </div>
                                                {planReinforcements.length > 0 && (
                                                    <div className="space-y-1">
                                                        {planReinforcements.map((r, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                                <span>Mes {r.month}: Gs. {r.amount.toLocaleString('es-PY')}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5"
                                                                    onClick={() => removeReinforcement(plan.id!, idx)}
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Mes"
                                                        className="w-20"
                                                        value={newReinforcement[plan.id]?.month || ''}
                                                        onChange={(e) => setNewReinforcement({
                                                            ...newReinforcement,
                                                            [plan.id!]: { ...newReinforcement[plan.id!], month: Number(e.target.value) }
                                                        })}
                                                    />
                                                    <Input
                                                        type="text"
                                                        placeholder="Monto (Gs.)"
                                                        className="flex-1"
                                                        value={newReinforcement[plan.id]?.amount ? newReinforcement[plan.id]?.amount.toLocaleString('es-PY') : ''}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\./g, '')
                                                            setNewReinforcement({
                                                                ...newReinforcement,
                                                                [plan.id!]: { ...newReinforcement[plan.id!], amount: Number(rawValue) }
                                                            })
                                                        }}
                                                    />
                                                    <Button size="sm" onClick={() => addReinforcement(plan.id!)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Payment Schedule Table */}
                                            {schedule.length > 0 && (
                                                <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[60px]">Mes</TableHead>
                                                                <TableHead>Cuota</TableHead>
                                                                <TableHead>Capital</TableHead>
                                                                <TableHead>Interés</TableHead>
                                                                <TableHead>Saldo</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {schedule.map((row, idx) => (
                                                                <TableRow key={idx} className={row.isReinforcement ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                                                                    <TableCell className="font-medium">
                                                                        {row.month}
                                                                        {row.isReinforcement && <span className="ml-1 text-xs text-green-600">R</span>}
                                                                    </TableCell>
                                                                    <TableCell>Gs. {row.payment.toLocaleString('es-PY')}</TableCell>
                                                                    <TableCell>Gs. {row.principal.toLocaleString('es-PY')}</TableCell>
                                                                    <TableCell>Gs. {row.interest.toLocaleString('es-PY')}</TableCell>
                                                                    <TableCell>Gs. {row.balance.toLocaleString('es-PY')}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Add New Plan Form */}
                <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium">Agregar Nuevo Plan</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre del Plan</Label>
                            <Input
                                placeholder="Ej: Plan 12 meses"
                                value={newPlan.name}
                                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Meses</Label>
                            <Input
                                type="number"
                                value={newPlan.months}
                                onChange={(e) => setNewPlan({ ...newPlan, months: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Interés Anual (%)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newPlan.annual_interest_rate}
                                onChange={(e) => setNewPlan({ ...newPlan, annual_interest_rate: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Entrega Inicial (Gs.)</Label>
                            <Input
                                type="text"
                                placeholder="Opcional"
                                value={newPlan.suggested_down_payment ? newPlan.suggested_down_payment.toLocaleString('es-PY') : ''}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\./g, '')
                                    const value = rawValue ? Number(rawValue) : undefined
                                    setNewPlan({
                                        ...newPlan,
                                        suggested_down_payment: value,
                                        suggested_down_payment_percentage: undefined
                                    })
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>O Porcentaje (%)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="Opcional"
                                value={newPlan.suggested_down_payment_percentage || ''}
                                onChange={(e) => setNewPlan({
                                    ...newPlan,
                                    suggested_down_payment_percentage: e.target.value ? Number(e.target.value) : undefined,
                                    suggested_down_payment: undefined
                                })}
                            />
                        </div>
                    </div>

                    {/* New Plan Reinforcements */}
                    <div className="space-y-2 border p-3 rounded-md bg-muted/20">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Refuerzos para este plan nuevo</Label>

                        {/* List of added reinforcements for new plan */}
                        {(newPlan.reinforcements || []).length > 0 && (
                            <div className="space-y-1 mb-2">
                                {(newPlan.reinforcements || []).map((r, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm bg-background p-2 rounded border">
                                        <span>Mes {r.month}: <strong>Gs. {r.amount.toLocaleString('es-PY')}</strong></span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 ml-auto"
                                            onClick={() => {
                                                const updated = (newPlan.reinforcements || []).filter((_, i) => i !== idx)
                                                setNewPlan({ ...newPlan, reinforcements: updated })
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <div className="space-y-1">
                                <Label className="text-xs">Mes</Label>
                                <Input
                                    type="number"
                                    placeholder="Mes"
                                    className="w-20 h-8 text-sm"
                                    value={newReinforcement['new']?.month || ''}
                                    onChange={(e) => setNewReinforcement({
                                        ...newReinforcement,
                                        'new': { ...newReinforcement['new'], month: Number(e.target.value) }
                                    })}
                                />
                            </div>
                            <div className="space-y-1 flex-1">
                                <Label className="text-xs">Monto (Gs.)</Label>
                                <Input
                                    type="text"
                                    placeholder="Monto"
                                    className="h-8 text-sm"
                                    value={newReinforcement['new']?.amount ? newReinforcement['new']?.amount.toLocaleString('es-PY') : ''}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\./g, '')
                                        setNewReinforcement({
                                            ...newReinforcement,
                                            'new': { ...newReinforcement['new'], amount: Number(rawValue) }
                                        })
                                    }}
                                />
                            </div>
                            <Button
                                size="sm"
                                className="h-8"
                                onClick={() => {
                                    const r = newReinforcement['new']
                                    if (!r || !r.month || !r.amount) return
                                    const current = newPlan.reinforcements || []
                                    setNewPlan({
                                        ...newPlan,
                                        reinforcements: [...current, { month: r.month, amount: r.amount }].sort((a, b) => a.month - b.month)
                                    })
                                    setNewReinforcement({
                                        ...newReinforcement,
                                        'new': { month: 0, amount: 0 }
                                    })
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Agregar
                            </Button>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Vista Previa de Cuotas</h5>
                        {(() => {
                            const tempPlan: PaymentPlan = {
                                id: 'preview',
                                ...newPlan,
                                reinforcements: newPlan.reinforcements
                            }
                            const schedule = getPaymentSchedule(tempPlan)
                            const summary = schedule.length > 0 ? getScheduleSummary(schedule) : null

                            if (!summary) return <p className="text-xs text-muted-foreground">Configure los parámetros para ver el cálculo.</p>

                            // Calculate end date assuming start today
                            const today = new Date()
                            today.setMonth(today.getMonth() + summary.actualMonths)
                            const endDate = today.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })

                            return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Cuota Mensual Estimada</span>
                                        <span className="text-xl font-bold text-primary">Gs. {summary.monthlyPayment.toLocaleString('es-PY', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Fecha Finalización Aprox.</span>
                                        <span className="text-lg font-semibold">{endDate}</span>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>

                    <Button onClick={handleAddPlan} disabled={isSaving} size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Guardar Plan
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

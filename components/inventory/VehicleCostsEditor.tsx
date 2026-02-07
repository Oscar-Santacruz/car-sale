'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxTrigger,
    ComboboxValue,
} from "@/components/ui/combobox"
import {
    addVehicleCostAction,
    updateVehicleCostAction,
    deleteVehicleCostAction
} from "@/app/inventory-actions"

interface VehicleCost {
    id: string
    concept_id: string
    amount: number
    cost_concepts: {
        name: string
    }
}

interface CostConcept {
    id: string
    name: string
}

interface VehicleCostsEditorProps {
    vehicleId: string
    initialCosts: VehicleCost[]
    costConcepts: CostConcept[]
    initialMargin: number
    onCostUpdate?: () => void
}

export function VehicleCostsEditor({
    vehicleId,
    initialCosts,
    costConcepts,
    initialMargin,
    onCostUpdate
}: VehicleCostsEditorProps) {
    const router = useRouter()
    const [costs, setCosts] = useState(initialCosts)
    const [newCost, setNewCost] = useState({ conceptId: '', amount: 0 })
    const [isAdding, setIsAdding] = useState(false)
    const [updatingCost, setUpdatingCost] = useState<string | null>(null)

    const handleAddCost = async () => {
        if (!newCost.conceptId || newCost.amount <= 0) {
            toast.error("Seleccione un concepto e ingrese un monto válido")
            return
        }

        try {
            await addVehicleCostAction({
                vehicleId,
                conceptId: newCost.conceptId,
                amount: newCost.amount
            })

            toast.success("Costo agregado")
            setNewCost({ conceptId: '', amount: 0 })
            setIsAdding(false)
            router.refresh()
            onCostUpdate?.()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleUpdateCost = async (costId: string, amount: number) => {
        if (amount <= 0) {
            toast.error("El monto debe ser mayor a 0")
            return
        }

        setUpdatingCost(costId)
        try {
            await updateVehicleCostAction({
                costId,
                amount
            })

            toast.success("Costo actualizado")
            router.refresh()
            onCostUpdate?.()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setUpdatingCost(null)
        }
    }

    const handleDeleteCost = async (costId: string) => {
        if (!confirm("¿Eliminar este costo?")) return

        try {
            await deleteVehicleCostAction(costId)
            toast.success("Costo eliminado")
            router.refresh()
            onCostUpdate?.()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const totalCost = costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
    const listPrice = Math.round(totalCost * (1 + initialMargin / 100))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalles de Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead className="w-[140px]">Monto</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costs.map((cost) => (
                                <TableRow key={cost.id}>
                                    <TableCell>
                                        <span className="font-medium">{cost.cost_concepts?.name || 'Concepto no encontrado'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="text"
                                            value={cost.amount > 0 ? cost.amount.toLocaleString('es-PY') : ''}
                                            onChange={(e) => {
                                                const val = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''))
                                                if (!isNaN(val) && val !== cost.amount) {
                                                    handleUpdateCost(cost.id, val)
                                                }
                                            }}
                                            className="h-9"
                                            placeholder="0"
                                            disabled={updatingCost === cost.id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteCost(cost.id)}
                                            disabled={updatingCost === cost.id}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {isAdding && (
                                <TableRow className="bg-muted/50">
                                    <TableCell>
                                        <Combobox
                                            value={newCost.conceptId}
                                            onValueChange={(value) => setNewCost(prev => ({ ...prev, conceptId: value || '' }))}
                                        >
                                            <ComboboxTrigger className="w-full h-9">
                                                <ComboboxValue placeholder="Seleccionar concepto...">
                                                    {costConcepts.find(c => c.id === newCost.conceptId)?.name || 'Seleccionar...'}
                                                </ComboboxValue>
                                            </ComboboxTrigger>
                                            <ComboboxContent>
                                                <ComboboxInput placeholder="Buscar..." />
                                                <ComboboxList>
                                                    <ComboboxEmpty>No encontrado</ComboboxEmpty>
                                                    {costConcepts
                                                        .filter(concept => !costs.find(c => c.concept_id === concept.id))
                                                        .map(concept => (
                                                            <ComboboxItem key={concept.id} value={concept.id}>
                                                                {concept.name}
                                                            </ComboboxItem>
                                                        ))}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="text"
                                            value={newCost.amount > 0 ? newCost.amount.toLocaleString('es-PY') : ''}
                                            onChange={(e) => {
                                                const val = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''))
                                                setNewCost(prev => ({ ...prev, amount: isNaN(val) ? 0 : val }))
                                            }}
                                            className="h-9"
                                            placeholder="0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsAdding(false)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}

                            <TableRow>
                                <TableCell colSpan={3}>
                                    {isAdding ? (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full"
                                            onClick={handleAddCost}
                                            disabled={!newCost.conceptId || newCost.amount <= 0}
                                        >
                                            Guardar Costo
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setIsAdding(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Agregar Costo
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <Label>Total Costos</Label>
                        <div className="text-2xl font-bold">Gs. {totalCost.toLocaleString('es-PY')}</div>
                    </div>
                    <div>
                        <Label>Margen: {initialMargin}%</Label>
                        <div className="text-2xl font-bold text-green-700">Gs. {listPrice.toLocaleString('es-PY')}</div>
                        <p className="text-xs text-muted-foreground">Precio sugerido</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

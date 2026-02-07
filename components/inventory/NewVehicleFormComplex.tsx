'use client'

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { createVehicleComplexAction } from "@/app/inventory-actions"
import { Trash2, Plus } from "lucide-react"
import { FileUploader } from "@/components/ui/file-uploader"
import { VehiclePaymentPlanManager } from "./VehiclePaymentPlanManager"
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

interface ParametricData {
    brands: any[]
    models: any[]
    categories: any[]
    types: any[]
    costConcepts: any[]
}

export function NewVehicleFormComplex({ data }: { data: ParametricData }) {
    // FORM STATE
    const [formData, setFormData] = useState({
        cod: "",
        chassis: "",
        brandId: "",
        modelId: "",
        categoryId: "",
        typeId: "",
        year: new Date().getFullYear(),
        color: "",
        motor: "",
        margin: 20, // 20% default
        status: "available"
    })

    const [costs, setCosts] = useState<{ conceptId: string, amount: number }[]>([])
    const [images, setImages] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // HANDLERS
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // COSTS LOIGC
    const handleAddCost = () => {
        // Default to first concept if available
        const defaultConcept = data.costConcepts.length > 0 ? data.costConcepts[0].id : ""
        setCosts([...costs, { conceptId: defaultConcept, amount: 0 }])
    }

    const updateCost = (index: number, field: 'conceptId' | 'amount', value: any) => {
        const newCosts = [...costs]
        newCosts[index] = { ...newCosts[index], [field]: value }
        setCosts(newCosts)
    }

    const removeCost = (index: number) => {
        setCosts(costs.filter((_, i) => i !== index))
    }

    // CALCULATIONS
    const totalCost = useMemo(() => {
        return costs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    }, [costs])

    const listPrice = useMemo(() => {
        const marginMultiplier = 1 + (Number(formData.margin) / 100)
        return Math.round(totalCost * marginMultiplier)
    }, [totalCost, formData.margin])

    const handleSubmit = async () => {
        if (!formData.brandId || !formData.modelId) {
            toast.warning("Marca y Modelo son obligatorios")
            return
        }
        setIsSubmitting(true)

        try {
            const result = await createVehicleComplexAction({
                ...formData,
                year: Number(formData.year),
                margin: Number(formData.margin),
                listPrice,
                costs,
                images // Added images
            })
            if (result.success) {
                // Redirect client-side
                toast.success("Vehículo creado exitosamente")
                window.location.href = '/inventory'
            }
        } catch (error: any) {
            console.error(error)
            toast.error("Error al guardar: " + error.message)
            setIsSubmitting(false)
        }
    }

    // Filter models based on brand
    const filteredModels = useMemo(() => {
        if (!formData.brandId) return []
        return data.models.filter(m => m.brand_id === formData.brandId)
    }, [data.models, formData.brandId])

    return (
        <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* LEFT COLUMN: VEHICLE DETAILS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos de la Unidad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código (ID) <span className="text-red-500">*</span></Label>
                                <Input name="cod" value={formData.cod} onChange={handleChange} placeholder="Ej: 87" />
                            </div>
                            <div className="space-y-2">
                                <Label>N° De Chasis (Opcional)</Label>
                                <Input name="chassis" value={formData.chassis} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Familia (Condición) <span className="text-red-500">*</span></Label>
                                <Combobox
                                    value={formData.categoryId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value || '' }))}
                                >
                                    <ComboboxTrigger className="w-full">
                                        <ComboboxValue placeholder="Seleccionar...">
                                            {data.categories.find(c => c.id === formData.categoryId)?.name || 'Seleccionar...'}
                                        </ComboboxValue>
                                    </ComboboxTrigger>
                                    <ComboboxContent>
                                        <ComboboxInput placeholder="Buscar..." />
                                        <ComboboxList>
                                            <ComboboxEmpty>No encontrado</ComboboxEmpty>
                                            {data.categories.map(c => (
                                                <ComboboxItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                            <div className="space-y-2">
                                <Label>Sub Familia (Tipo) <span className="text-red-500">*</span></Label>
                                <Combobox
                                    value={formData.typeId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value || '' }))}
                                >
                                    <ComboboxTrigger className="w-full">
                                        <ComboboxValue placeholder="Seleccionar...">
                                            {data.types.find(t => t.id === formData.typeId)?.name || 'Seleccionar...'}
                                        </ComboboxValue>
                                    </ComboboxTrigger>
                                    <ComboboxContent>
                                        <ComboboxInput placeholder="Buscar..." />
                                        <ComboboxList>
                                            <ComboboxEmpty>No encontrado</ComboboxEmpty>
                                            {data.types.map(t => (
                                                <ComboboxItem key={t.id} value={t.id}>
                                                    {t.name}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Marca <span className="text-red-500">*</span></Label>
                                <Combobox
                                    value={formData.brandId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value || '', modelId: '' }))}
                                >
                                    <ComboboxTrigger className="w-full">
                                        <ComboboxValue placeholder="Seleccionar...">
                                            {data.brands.find(b => b.id === formData.brandId)?.name || 'Seleccionar...'}
                                        </ComboboxValue>
                                    </ComboboxTrigger>
                                    <ComboboxContent>
                                        <ComboboxInput placeholder="Buscar marca..." />
                                        <ComboboxList>
                                            <ComboboxEmpty>No encontrado</ComboboxEmpty>
                                            {data.brands.map(b => (
                                                <ComboboxItem key={b.id} value={b.id}>
                                                    {b.name}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo <span className="text-red-500">*</span></Label>
                                <Combobox
                                    value={formData.modelId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, modelId: value || '' }))}
                                    disabled={!formData.brandId}
                                >
                                    <ComboboxTrigger className="w-full" disabled={!formData.brandId}>
                                        <ComboboxValue placeholder="Seleccionar...">
                                            {filteredModels.find(m => m.id === formData.modelId)?.name || 'Seleccionar...'}
                                        </ComboboxValue>
                                    </ComboboxTrigger>
                                    <ComboboxContent>
                                        <ComboboxInput placeholder="Buscar modelo..." />
                                        <ComboboxList>
                                            <ComboboxEmpty>No encontrado</ComboboxEmpty>
                                            {filteredModels.map(m => (
                                                <ComboboxItem key={m.id} value={m.id}>
                                                    {m.name}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Año <span className="text-red-500">*</span></Label>
                                <Input name="year" type="number" value={formData.year} onChange={handleChange} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>N° De Motor <span className="text-red-500">*</span></Label>
                                <Input name="motor" value={formData.motor} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Color <span className="text-red-500">*</span></Label>
                            <Input name="color" value={formData.color} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: TITULAR & FINANCIALS */}
                <div className="space-y-6">
                    {/* Removed Data Titular Card */}

                    <Card>
                        <CardHeader>
                            <CardTitle>Galería de Imágenes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-md border overflow-hidden group">
                                        <img src={url} alt={`Vehicle ${idx}`} className="object-cover w-full h-full" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-80 hover:opacity-100"
                                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <FileUploader
                                bucket="vehicles"
                                onUploadComplete={(url) => setImages(prev => [...prev, url])}
                                onBatchUploadComplete={(urls) => setImages(prev => [...prev, ...urls])}
                                className="w-full"
                                multiple={true}
                            />
                        </CardContent>
                    </Card>

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
                                            <TableHead className="w-[120px]">Monto</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {costs.map((cost, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Combobox
                                                        value={cost.conceptId}
                                                        onValueChange={(value) => updateCost(idx, 'conceptId', value || '')}
                                                    >
                                                        <ComboboxTrigger className="w-full h-9">
                                                            <ComboboxValue placeholder="Concepto">
                                                                {data.costConcepts.find(c => c.id === cost.conceptId)?.name || 'Concepto'}
                                                            </ComboboxValue>
                                                        </ComboboxTrigger>
                                                        <ComboboxContent>
                                                            <ComboboxInput placeholder="Buscar..." />
                                                            <ComboboxList>
                                                                <ComboboxEmpty>No encontrado</ComboboxEmpty>
                                                                {data.costConcepts.map(c => (
                                                                    <ComboboxItem key={c.id} value={c.id}>
                                                                        {c.name}
                                                                    </ComboboxItem>
                                                                ))}
                                                            </ComboboxList>
                                                        </ComboboxContent>
                                                    </Combobox>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={cost.amount > 0 ? cost.amount.toLocaleString('es-PY') : ''}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''))
                                                            updateCost(idx, 'amount', isNaN(val) ? 0 : val)
                                                        }}
                                                        className="h-9"
                                                        placeholder="0"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeCost(idx)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Button variant="outline" size="sm" className="w-full" onClick={handleAddCost}>
                                                    <Plus className="mr-2 h-4 w-4" /> Agregar Costo
                                                </Button>
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
                                    <Label>Margen Esperado (%)</Label>
                                    <Input
                                        name="margin"
                                        type="number"
                                        value={formData.margin}
                                        onChange={handleChange}
                                        className="font-bold text-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 bg-muted/50 p-4 rounded-lg">
                                <Label className="text-lg">Precio Contado (Sugerido)</Label>
                                <div className="text-3xl font-bold text-green-700">Gs. {listPrice.toLocaleString('es-PY')}</div>
                                <p className="text-xs text-muted-foreground mt-1">Costo + {formData.margin}%</p>
                            </div>
                        </CardContent>
                    </Card>

                    <VehiclePaymentPlanManager vehiclePrice={listPrice} />

                    <Button className="w-full text-lg h-12" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "GUARDAR COMPRA"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

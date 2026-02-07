'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog"
import {
    Combobox,
    ComboboxTrigger,
    ComboboxValue,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox"

interface Brand {
    id: string
    name: string
}

interface Model {
    id: string
    name: string
    brand_id?: string
    brands?: Brand
}

interface ModelManagerProps {
    models: Model[]
    brands: Brand[]
    onSave: (name: string, brandId?: string, id?: string) => Promise<void>
    onDelete: (id: string, reason?: string) => Promise<any>
}

interface BrandOption {
    value: string
    label: string
}

export function ModelManager({ models, brands, onSave, onDelete }: ModelManagerProps) {
    const [newName, setNewName] = useState("")
    const [selectedBrand, setSelectedBrand] = useState<string>("")
    const [filterBrand, setFilterBrand] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editBrand, setEditBrand] = useState<string>("")

    // Deletion states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<Model | null>(null)

    const handleAdd = async () => {
        if (!newName.trim()) return
        setIsSubmitting(true)
        try {
            await onSave(newName, selectedBrand || undefined)
            setNewName("")
            setSelectedBrand("")
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar el modelo')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (item: Model) => {
        setEditingId(item.id)
        setEditName(item.name)
        setEditBrand(item.brand_id || "")
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditName("")
        setEditBrand("")
    }

    const handleSaveEdit = async () => {
        if (!editName.trim() || !editingId) return
        setIsSubmitting(true)
        try {
            await onSave(editName, editBrand || undefined, editingId)
            setEditingId(null)
            setEditName("")
            setEditBrand("")
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el modelo')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (item: Model) => {
        setItemToDelete(item)
        setShowDeleteConfirm(true)
    }

    const handleConfirmDelete = async (reason: string) => {
        if (!itemToDelete) return
        setIsSubmitting(true)
        try {
            const result: any = await onDelete(itemToDelete.id, reason)

            if (result && typeof result === 'object') {
                if (result.success) {
                    toast.success(result.message || 'Modelo eliminado correctamente')
                } else {
                    toast.error(result.message || 'Error al eliminar', {
                        description: result.error ? `Causa: ${result.message}` : undefined,
                        duration: 5000
                    })
                }
            } else {
                toast.success('Modelo eliminado correctamente')
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Error al eliminar')
        } finally {
            setIsSubmitting(false)
            setItemToDelete(null)
            setShowDeleteConfirm(false)
        }
    }

    const filteredModels = filterBrand
        ? models.filter(m => m.brand_id === filterBrand)
        : models

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-4 space-y-2">
                <CardTitle className="text-lg font-medium">Modelos</CardTitle>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por Marca:</span>
                    <Combobox
                        value={filterBrand}
                        onValueChange={setFilterBrand}
                    >
                        <ComboboxTrigger className="w-full">
                            <ComboboxValue placeholder="Todas">
                                {filterBrand ? brands.find(b => b.id === filterBrand)?.name || "Todas" : "Todas"}
                            </ComboboxValue>
                        </ComboboxTrigger>
                        <ComboboxContent>
                            <ComboboxInput placeholder="Buscar..." />
                            <ComboboxList>
                                <ComboboxEmpty>No se encontraron marcas</ComboboxEmpty>
                                <ComboboxItem value="">Todas</ComboboxItem>
                                {brands.map(b => (
                                    <ComboboxItem key={b.id} value={b.id}>{b.name}</ComboboxItem>
                                ))}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2">
                    <div className="w-[180px]">
                        <Combobox
                            value={selectedBrand}
                            onValueChange={setSelectedBrand}
                        >
                            <ComboboxTrigger className="w-full">
                                <ComboboxValue placeholder="Sin Marca">
                                    {selectedBrand ? brands.find(b => b.id === selectedBrand)?.name || "Sin Marca" : "Sin Marca"}
                                </ComboboxValue>
                            </ComboboxTrigger>
                            <ComboboxContent>
                                <ComboboxInput placeholder="Buscar..." />
                                <ComboboxList>
                                    <ComboboxEmpty>No se encontraron marcas</ComboboxEmpty>
                                    <ComboboxItem value="">Sin Marca</ComboboxItem>
                                    {brands.map(b => (
                                        <ComboboxItem key={b.id} value={b.id}>{b.name}</ComboboxItem>
                                    ))}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>
                    <Input
                        placeholder="Nuevo Modelo..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd} disabled={isSubmitting || !newName.trim()}>
                        Agregar
                    </Button>
                </div>

                <div className="rounded-md border overflow-auto text-[13px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Marca</TableHead>
                                <TableHead>Modelo</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredModels.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                        Sin registros
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredModels.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {editingId === item.id ? (
                                                <Combobox
                                                    value={editBrand}
                                                    onValueChange={setEditBrand}
                                                >
                                                    <ComboboxTrigger className="w-full">
                                                        <ComboboxValue placeholder="Sin Marca">
                                                            {editBrand ? brands.find(b => b.id === editBrand)?.name || "Sin Marca" : "Sin Marca"}
                                                        </ComboboxValue>
                                                    </ComboboxTrigger>
                                                    <ComboboxContent>
                                                        <ComboboxInput placeholder="Buscar..." />
                                                        <ComboboxList>
                                                            <ComboboxEmpty>No se encontraron marcas</ComboboxEmpty>
                                                            <ComboboxItem value="">Sin Marca</ComboboxItem>
                                                            {brands.map(b => (
                                                                <ComboboxItem key={b.id} value={b.id}>{b.name}</ComboboxItem>
                                                            ))}
                                                        </ComboboxList>
                                                    </ComboboxContent>
                                                </Combobox>
                                            ) : (
                                                <span className="text-muted-foreground">{item.brands?.name || "-"}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.id ? (
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                item.name
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {editingId === item.id ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={handleSaveEdit}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={handleCancelEdit}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteClick(item)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <DeleteConfirmDialog
                isOpen={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                onConfirm={handleConfirmDelete}
                title="Eliminar Modelo"
                description={`¿Está seguro de eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
                isLoading={isSubmitting}
            />
        </Card>
    )
}

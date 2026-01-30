'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Pencil, Check, X } from "lucide-react"

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
    onDelete: (id: string) => Promise<void>
}

export function ModelManager({ models, brands, onSave, onDelete }: ModelManagerProps) {
    const [newName, setNewName] = useState("")
    const [selectedBrand, setSelectedBrand] = useState("")
    const [filterBrand, setFilterBrand] = useState("") // To filter the list
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editBrand, setEditBrand] = useState("")

    const handleAdd = async () => {
        if (!newName.trim()) return
        setIsSubmitting(true)
        try {
            await onSave(newName, selectedBrand || undefined)
            setNewName("")
            // Keep brand selected for rapid entry
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEdit = (item: Model) => {
        setEditingId(item.id)
        setEditName(item.name)
        setEditBrand(item.brand_id || "")
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName("")
        setEditBrand("")
    }

    const saveEdit = async () => {
        if (!editName.trim() || !editingId) return
        setIsSubmitting(true)
        try {
            await onSave(editName, editBrand || undefined, editingId)
            setEditingId(null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este modelo?")) return
        try {
            await onDelete(id)
        } catch (error) {
            console.error(error)
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
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2">
                    <select
                        className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                        <option value="">Sin Marca</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
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

                <div className="rounded-md border overflow-auto">
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
                                                <select
                                                    className="h-8 w-full rounded-md border border-input text-sm"
                                                    value={editBrand}
                                                    onChange={(e) => setEditBrand(e.target.value)}
                                                >
                                                    <option value="">Sin Marca</option>
                                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
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
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={saveEdit}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={cancelEdit}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(item.id)}>
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
        </Card>
    )
}

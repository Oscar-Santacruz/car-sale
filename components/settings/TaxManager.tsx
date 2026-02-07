'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Pencil, Check, X } from "lucide-react"

import { toast } from "sonner"

interface Tax {
    id: string
    name: string
    rate: number
}

interface TaxManagerProps {
    taxes: Tax[]
    onSave: (name: string, rate: number, id?: string) => Promise<void>
    onDelete: (id: string) => Promise<any>
}

export function TaxManager({ taxes, onSave, onDelete }: TaxManagerProps) {
    const [newName, setNewName] = useState("")
    const [newRate, setNewRate] = useState("0.10") // Default string for input
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editRate, setEditRate] = useState("")

    const handleAdd = async () => {
        if (!newName.trim()) return
        setIsSubmitting(true)
        try {
            await onSave(newName, parseFloat(newRate))
            setNewName("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEdit = (item: Tax) => {
        setEditingId(item.id)
        setEditName(item.name)
        setEditRate(item.rate.toString())
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName("")
        setEditRate("")
    }

    const saveEdit = async () => {
        if (!editName.trim() || !editingId) return
        setIsSubmitting(true)
        try {
            await onSave(editName, parseFloat(editRate), editingId)
            setEditingId(null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este impuesto?")) return
        setIsSubmitting(true)
        try {
            const result = await onDelete(id)
            if (result && typeof result === 'object') {
                if (result.success) {
                    toast.success(result.message || 'Impuesto eliminado correctamente')
                } else {
                    toast.error(result.message || 'Error al eliminar', {
                        description: result.error ? `Causa: ${result.message}` : undefined,
                        duration: 5000
                    })
                }
            } else {
                toast.success('Impuesto eliminado correctamente')
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Error al eliminar')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-4">
                <CardTitle className="text-lg font-medium">Impuestos</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2">
                    <Input
                        placeholder="Nombre (IVA 10%)..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        type="number"
                        placeholder="Tasa (0.10)"
                        value={newRate}
                        step="0.01"
                        onChange={(e) => setNewRate(e.target.value)}
                        className="w-[100px]"
                    />
                    <Button onClick={handleAdd} disabled={isSubmitting || !newName.trim()}>
                        Agregar
                    </Button>
                </div>

                <div className="rounded-md border overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tasa</TableHead>
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                        Sin registros
                                    </TableCell>
                                </TableRow>
                            ) : (
                                taxes.map((item) => (
                                    <TableRow key={item.id}>
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
                                        <TableCell>
                                            {editingId === item.id ? (
                                                <Input
                                                    type="number"
                                                    value={editRate}
                                                    step="0.01"
                                                    onChange={(e) => setEditRate(e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                `${(item.rate * 100).toFixed(0)}% (${item.rate})`
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

'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Pencil, Check, X } from "lucide-react"

interface Item {
    id: string
    name: string
    [key: string]: any
}

interface SimpleCatalogManagerProps {
    title: string
    items: Item[]
    onSave: (name: string, id?: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export function SimpleCatalogManager({ title, items, onSave, onDelete }: SimpleCatalogManagerProps) {
    const [newName, setNewName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")

    const handleAdd = async () => {
        if (!newName.trim()) return
        setIsSubmitting(true)
        try {
            await onSave(newName)
            setNewName("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEdit = (item: Item) => {
        setEditingId(item.id)
        setEditName(item.name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName("")
    }

    const saveEdit = async () => {
        if (!editName.trim() || !editingId) return
        setIsSubmitting(true)
        try {
            await onSave(editName, editingId)
            setEditingId(null)
            setEditName("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este ítem?")) return
        try {
            await onDelete(id)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-4">
                <CardTitle className="text-lg font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2">
                    <Input
                        placeholder="Nuevo ítem..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        disabled={isSubmitting}
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
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                                        Sin registros
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
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

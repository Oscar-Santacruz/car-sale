'use client'

import { useState } from "react"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BankAccount {
    id: string
    bank_name: string
    account_number: string
    currency: string
}

interface BankAccountManagerProps {
    items: BankAccount[]
    onSave: (data: Omit<BankAccount, 'id'>, id?: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export function BankAccountManager({ items, onSave, onDelete }: BankAccountManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<BankAccount | null>(null)
    const [formData, setFormData] = useState({
        bank_name: "",
        account_number: "",
        currency: "GS"
    })

    const handleOpen = (item?: BankAccount) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                bank_name: item.bank_name,
                account_number: item.account_number,
                currency: item.currency
            })
        } else {
            setEditingItem(null)
            setFormData({
                bank_name: "",
                account_number: "",
                currency: "GS"
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            await onSave(formData, editingItem?.id)
            setIsDialogOpen(false)
        } catch (error) {
            console.error(error)
            alert("Error al guardar")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar esta cuenta?")) return
        setIsDeleting(id)
        try {
            await onDelete(id)
        } catch (error) {
            console.error(error)
            alert("Error al eliminar")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Cuentas Bancarias
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gestione las cuentas para cobros por transferencia.
                    </p>
                </div>
                <Button size="sm" onClick={() => handleOpen()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cuenta
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Banco / Entidad</TableHead>
                            <TableHead>N° Cuenta</TableHead>
                            <TableHead>Moneda</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                    No hay cuentas registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.bank_name}</TableCell>
                                    <TableCell>{item.account_number}</TableCell>
                                    <TableCell>{item.currency}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpen(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={isDeleting === item.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Editar Cuenta" : "Nueva Cuenta"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Banco / Entidad</Label>
                            <Input
                                placeholder="Ej: Itaú, Banco Familiar..."
                                value={formData.bank_name}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Número de Cuenta</Label>
                            <Input
                                placeholder="Ej: 123456789"
                                value={formData.account_number}
                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Moneda</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(val) => setFormData({ ...formData, currency: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GS">Guaraníes (GS)</SelectItem>
                                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

'use client'

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (reason: string) => Promise<void>
    title: string
    description: string
    isLoading?: boolean
}

export function DeleteConfirmDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
    isLoading = false
}: DeleteConfirmDialogProps) {
    const [reason, setReason] = useState("")

    const handleConfirm = async () => {
        if (!reason.trim()) return
        await onConfirm(reason)
        setReason("")
        onOpenChange(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Motivo de la eliminación (Requerido)</label>
                        <Textarea
                            placeholder="Ej: Error al cargar datos, Venta cancelada por el cliente, etc."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading ? "Eliminando..." : "Eliminar Definitivamente"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

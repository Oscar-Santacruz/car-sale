'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteSaleAction } from "@/app/sales-actions"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog"

interface DeleteSaleButtonProps {
    saleId: string
}

export function DeleteSaleButton({ saleId }: DeleteSaleButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleConfirmDeletion = async (reason: string) => {
        startTransition(async () => {
            try {
                const result = await deleteSaleAction(saleId, reason)
                if (result.success) {
                    toast.success(result.message)
                    router.push('/sales')
                } else {
                    toast.error(result.message, {
                        description: result.error ? `Causa: ${result.error}` : undefined,
                        duration: 5000
                    })
                }
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar la venta")
            }
        })
    }

    return (
        <>
            <Button variant="destructive" onClick={() => setShowConfirm(true)} disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isPending ? 'Eliminando...' : 'Eliminar Venta'}
            </Button>

            <DeleteConfirmDialog
                isOpen={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmDeletion}
                title="Eliminar Venta"
                description="¡ATENCIÓN! Al eliminar una venta, se borran todos sus pagos y cuotas asociados. El vehículo volverá a estar 'Disponible'."
                isLoading={isPending}
            />
        </>
    )
}

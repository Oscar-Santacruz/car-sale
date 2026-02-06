'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteSaleAction } from "@/app/sales-actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

interface DeleteSaleButtonProps {
    saleId: string
}

export function DeleteSaleButton({ saleId }: DeleteSaleButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = async () => {
        const confirmed = window.confirm("¡ATENCIÓN! Al eliminar una venta, se borran todos sus pagos y cuotas, y el vehículo vuelve a estar 'Disponible' en el inventario automáticamente. ¿Estás seguro de continuar?")
        if (confirmed) {
            startTransition(async () => {
                try {
                    await deleteSaleAction(saleId)
                    // Redirect is handled in server action, but for client side navigation we might need this
                } catch (error) {
                    alert("Error al eliminar la venta")
                }
            })
        }
    }

    return (
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? 'Eliminando...' : 'Eliminar Venta'}
        </Button>
    )
}

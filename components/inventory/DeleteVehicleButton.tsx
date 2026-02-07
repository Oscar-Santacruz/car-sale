'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteVehicleAction } from "@/app/inventory-actions"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog"

interface DeleteVehicleButtonProps {
    vehicleId: string
}

export function DeleteVehicleButton({ vehicleId }: DeleteVehicleButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleConfirmDeletion = async (reason: string) => {
        startTransition(async () => {
            try {
                const result = await deleteVehicleAction(vehicleId, reason)
                if (result.success) {
                    toast.success(result.message)
                    router.push('/inventory')
                } else {
                    toast.error(result.message, {
                        description: result.error ? `Motivo: ${result.error}` : undefined,
                        duration: 5000
                    })
                }
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar el vehículo")
            }
        })
    }

    return (
        <>
            <Button variant="destructive" onClick={() => setShowConfirm(true)} disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isPending ? 'Eliminando...' : 'Eliminar Vehículo'}
            </Button>

            <DeleteConfirmDialog
                isOpen={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmDeletion}
                title="Eliminar Vehículo"
                description="¿Estás seguro de que quieres eliminar este vehículo? Esta acción borrará el registro de forma permanente."
                isLoading={isPending}
            />
        </>
    )
}

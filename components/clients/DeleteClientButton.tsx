'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteClientAction } from "@/app/client-actions"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog"

interface DeleteClientButtonProps {
    clientId: string
}

export function DeleteClientButton({ clientId }: DeleteClientButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleConfirmDeletion = async (reason: string) => {
        startTransition(async () => {
            try {
                const result = await deleteClientAction(clientId, reason)
                if (result.success) {
                    toast.success(result.message)
                    router.push('/clients')
                } else {
                    toast.error(result.message, {
                        description: result.error ? `Motivo: ${result.error}` : undefined,
                        duration: 5000
                    })
                }
            } catch (error: any) {
                toast.error(error.message || "Error al eliminar el cliente")
            }
        })
    }

    return (
        <>
            <Button variant="destructive" onClick={() => setShowConfirm(true)} disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isPending ? 'Eliminando...' : 'Eliminar Cliente'}
            </Button>

            <DeleteConfirmDialog
                isOpen={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmDeletion}
                title="Eliminar Cliente"
                description="¿Estás seguro de que quieres eliminar este cliente? Esta acción borrará el registro de forma permanente."
                isLoading={isPending}
            />
        </>
    )
}

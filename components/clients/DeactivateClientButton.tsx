'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deactivateClientAction } from "@/app/actions"
import { useTransition } from "react"

interface DeactivateClientButtonProps {
    clientId: string
}

export function DeactivateClientButton({ clientId }: DeactivateClientButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDeactivate = async () => {
        const confirmed = window.confirm("¿Estás seguro de que quieres desactivar este cliente? Esta acción no se puede deshacer fácilmente.")
        if (confirmed) {
            startTransition(async () => {
                try {
                    await deactivateClientAction(clientId)
                    toast.success("Cliente desactivado correctamente")
                } catch (error) {
                    toast.error("Error al desactivar el cliente")
                }
            })
        }
    }

    return (
        <Button variant="destructive" onClick={handleDeactivate} disabled={isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? 'Desactivando...' : 'Desactivar Cliente'}
        </Button>
    )
}

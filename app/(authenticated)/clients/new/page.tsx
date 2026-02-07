'use client'

import { createClientAction } from "@/app/actions"
import { ClientForm } from "@/components/clients/ClientForm"

export default function NewClientPage() {
    return (
        <ClientForm
            action={createClientAction}
            title="Nuevo Cliente"
            description="Registre la información básica del cliente para comenzar."
            submitLabel="Guardar Cliente"
            cancelHref="/clients"
        />
    )
}

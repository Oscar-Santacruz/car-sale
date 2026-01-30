

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getParametricData } from "@/app/settings-actions"
import { NewVehicleFormComplex } from "@/components/inventory/NewVehicleFormComplex"

export const dynamic = 'force-dynamic'

export default async function NewVehiclePage() {
    const data = await getParametricData()

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Ingreso de Unidades</h2>
                <Link href="/inventory">
                    <Button variant="ghost">Cancelar</Button>
                </Link>
            </div>

            <NewVehicleFormComplex data={data} />
        </div>
    )
}

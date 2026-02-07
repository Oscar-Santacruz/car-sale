
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateVehicleAction } from "@/app/actions"
import { SubmitButton } from "@/components/ui/submit-button"
import { notFound } from "next/navigation"
import { VehicleGalleryManager } from "@/components/inventory/vehicle-managers"
import { VehicleCostsEditor } from "@/components/inventory/VehicleCostsEditor"

async function getVehicleData(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    console.log(`Fetching data for vehicle: ${id}`)

    try {
        const [vehicleResult, costsResult, conceptsResult] = await Promise.all([
            supabase.from('vehicles').select('*').eq('id', id).single(),
            supabase
                .from('vehicle_costs')
                .select('*, cost_concepts(name)')
                .eq('vehicle_id', id),
            supabase
                .from('cost_concepts')
                .select('*')
                .order('name')
        ])

        if (vehicleResult.error) console.error("Vehicle fetch error:", vehicleResult.error)
        if (costsResult.error) console.error("Costs fetch error:", costsResult.error)
        if (conceptsResult.error) console.error("Concepts fetch error:", conceptsResult.error)

        return {
            vehicle: vehicleResult.data,
            costs: costsResult.data || [],
            costConcepts: conceptsResult.data || []
        }
    } catch (error) {
        console.error("Error in getVehicleData:", error)
        return { vehicle: null, costs: [], costConcepts: [] }
    }
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditVehiclePage({ params }: PageProps) {
    const { id } = await params

    try {
        const data = await getVehicleData(id)

        if (!data.vehicle) notFound()

        return (
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Editar Vehículo</h2>
                    <Link href={`/inventory/${data.vehicle.id}`}>
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Imágenes del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VehicleGalleryManager vehicleId={data.vehicle.id} initialImages={data.vehicle.images || []} />
                    </CardContent>
                </Card>

                <VehicleCostsEditor
                    vehicleId={data.vehicle.id}
                    initialCosts={data.costs}
                    costConcepts={data.costConcepts}
                    initialMargin={data.vehicle.expected_margin || 20}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={updateVehicleAction} className="space-y-4">
                            <input type="hidden" name="id" value={data.vehicle.id} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cod">Código (COD)</Label>
                                    <Input id="cod" name="cod" defaultValue={data.vehicle.cod || ''} placeholder="Ej: V-001" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plate">Chapa</Label>
                                    <Input id="plate" name="plate" defaultValue={data.vehicle.plate || ''} placeholder="Ej: AAAA 123" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Marca</Label>
                                    <Input id="brand" name="brand" required defaultValue={data.vehicle.brand} placeholder="Ej: Toyota" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">Modelo</Label>
                                    <Input id="model" name="model" required defaultValue={data.vehicle.model} placeholder="Ej: Hilux" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Año</Label>
                                    <Input id="year" name="year" type="number" required defaultValue={data.vehicle.year} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio Lista ($)</Label>
                                    <Input id="price" name="price" type="number" step="0.01" required defaultValue={data.vehicle.list_price} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={data.vehicle.status || 'available'}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="available">Disponible</option>
                                        <option value="reserved">Reservado</option>
                                        <option value="sold">Vendido</option>
                                    </select>
                                </div>
                            </div>

                            <SubmitButton className="w-full">Guardar Cambios</SubmitButton>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    } catch (e: any) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                <h2 className="text-lg font-bold">Error al cargar la página</h2>
                <p className="text-sm opacity-80">{e.message || "Error desconocido"}</p>
                <div className="mt-4">
                    <Link href="/inventory">
                        <Button variant="outline">Volver al Inventario</Button>
                    </Link>
                </div>
            </div>
        )
    }
}

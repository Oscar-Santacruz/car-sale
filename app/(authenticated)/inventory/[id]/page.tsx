
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleGalleryManager, VehicleDocumentManager } from "@/components/inventory/vehicle-managers"
import { ArrowLeft, Pencil } from "lucide-react"
import { notFound } from "next/navigation"

async function getVehicle(id: string) {
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

    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
    if (error) {
        console.error("Error fetching vehicle", error)
        return null
    }
    return data
}



interface PageProps {
    params: Promise<{ id: string }>
}

export default async function VehicleDetailPage({ params }: PageProps) {
    const { id } = await params
    const vehicle = await getVehicle(id)

    if (!vehicle) notFound()

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/inventory">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Detalle del Vehículo</h2>
                </div>
                <Link href={`/inventory/${vehicle.id}/edit`}>
                    <Button>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Código</p>
                                <p className="text-lg">{vehicle.cod || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                    {vehicle.status === 'available' ? 'Disponible' : (vehicle.status === 'sold' ? 'Vendido' : vehicle.status)}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Marca</p>
                                <p className="text-lg">{vehicle.brand}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                                <p className="text-lg">{vehicle.model}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Año</p>
                                <p className="text-lg">{vehicle.year}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Chapa</p>
                                <p className="text-lg">{vehicle.plate || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Precio de Lista</p>
                            <p className="text-2xl font-bold text-green-700">Gs. {vehicle.list_price?.toLocaleString('es-PY')}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Imágenes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VehicleGalleryManager vehicleId={vehicle.id} initialImages={vehicle.images} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documentación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VehicleDocumentManager vehicleId={vehicle.id} initialDocuments={vehicle.documents} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

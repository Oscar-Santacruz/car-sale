import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Car } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

async function getVehicles() {
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

    const { data } = await supabase
        .from('vehicles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    return data || []
}

export default async function InventoryPage() {
    const vehicles = await getVehicles()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
                <Link href="/inventory/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
                    </Button>
                </Link>
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>COD</TableHead>
                            <TableHead>Vehículo</TableHead>
                            <TableHead>Año</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Precio Lista</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No hay vehículos en inventario.
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicles.map((car) => (
                                <TableRow key={car.id}>
                                    <TableCell className="font-medium">{car.cod || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {car.brand} {car.model}
                                        </div>
                                    </TableCell>
                                    <TableCell>{car.year}</TableCell>

                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${car.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {car.status === 'available' ? 'Disponible' : (car.status === 'sold' ? 'Vendido' : car.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-green-700">Gs. {Number(car.list_price).toLocaleString('es-PY')}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/inventory/${car.id}`}>
                                            <Button variant="ghost" size="sm">Ver</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { LayoutGrid, List, Car, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Vehicle {
    id: string
    cod: string | null
    brand: string | null
    model: string | null
    year: number | null
    status: string | null
    list_price: number | null
    images: string[] | null
    [key: string]: any
}

export function InventoryList({ vehicles }: { vehicles: Vehicle[] }) {
    const [view, setView] = useState<'card' | 'table'>('card')
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-end gap-2">
                    <Button
                        variant={view === 'card' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setView('card')}
                        title="Vista de Tarjetas"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'table' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setView('table')}
                        title="Vista de Lista"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                {view === 'card' ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {vehicles.length === 0 ? (
                            <div className="col-span-full text-center h-24 text-muted-foreground flex items-center justify-center border rounded-md bg-card">
                                No hay vehículos en inventario.
                            </div>
                        ) : (
                            vehicles.map((car) => (
                                <Card key={car.id} className="overflow-hidden">
                                    {car.images && car.images.length > 0 ? (
                                        <div
                                            className="relative h-32 w-full overflow-hidden cursor-pointer group"
                                            onClick={() => setPreviewImage(car.images![0])}
                                        >
                                            <img
                                                src={car.images[0]}
                                                alt={`${car.brand} ${car.model}`}
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1 rounded-md text-xs">
                                                    Click para ampliar
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-32 w-full items-center justify-center bg-muted">
                                            <Car className="h-10 w-10 text-muted-foreground/20" />
                                        </div>
                                    )}
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                                        <CardTitle className="text-sm font-medium truncate">
                                            {car.cod || 'N/A'}
                                        </CardTitle>
                                        <Car className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent className="space-y-1 p-3 pt-0">
                                        <div className="text-lg font-bold truncate" title={`${car.brand} ${car.model}`}>
                                            {car.brand} {car.model}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{car.year}</span>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${car.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {car.status === 'available' ? 'Disponible' : (car.status === 'sold' ? 'Vendido' : car.status)}
                                            </span>
                                        </div>
                                        <div className="text-base font-bold text-green-700">
                                            Gs. {Number(car.list_price).toLocaleString('es-PY')}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-3 pt-0">
                                        <Link href={`/inventory/${car.id}`} className="w-full">
                                            <Button className="w-full h-8 text-xs" variant="secondary">Ver</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
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
                )}
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Vista previa"
                                className="max-w-full max-h-[95vh] object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}


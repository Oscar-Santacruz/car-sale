'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createVehicleAction } from "@/app/actions"
import { SubmitButton } from "@/components/ui/submit-button"
import Link from "next/link"

export default function NewVehiclePage() {
    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Vehículo</h2>
                <Link href="/inventory">
                    <Button variant="ghost">Cancelar</Button>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Datos del Vehículo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createVehicleAction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cod">Código (COD)</Label>
                                <Input id="cod" name="cod" placeholder="Ej: V-001" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plate">Chapa</Label>
                                <Input id="plate" name="plate" placeholder="Ej: AAAA 123" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Marca</Label>
                                <Input id="brand" name="brand" required placeholder="Ej: Toyota" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Modelo</Label>
                                <Input id="model" name="model" required placeholder="Ej: Hilux" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">Año</Label>
                                <Input id="year" name="year" type="number" required defaultValue={new Date().getFullYear()} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio Lista ($)</Label>
                                <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="available">Disponible</option>
                                    <option value="reserved">Reservado</option>
                                    <option value="sold">Vendido</option>
                                </select>
                            </div>
                        </div>

                        <SubmitButton className="w-full">Guardar Vehículo</SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

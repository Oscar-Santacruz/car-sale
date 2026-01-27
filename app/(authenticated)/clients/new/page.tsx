'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientAction } from "@/app/actions"
import { SubmitButton } from "@/components/ui/submit-button"
import Link from "next/link"

export default function NewClientPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h2>
                <Link href="/clients">
                    <Button variant="ghost">Cancelar</Button>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Datos Personales</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createClientAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required placeholder="Ej: Juan Perez" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ci">Cédula de Identidad (C.I.)</Label>
                            <Input id="ci" name="ci" required placeholder="Ej: 1.234.567" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" placeholder="Ej: 0971 123 123" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" name="address" placeholder="Ej: Asunción, Centro" />
                        </div>
                        <SubmitButton className="w-full">Guardar Cliente</SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

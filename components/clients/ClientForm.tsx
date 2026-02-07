'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SubmitButton } from "@/components/ui/submit-button"
import Link from "next/link"
import { User, CreditCard, Phone, MapPin, Globe, ArrowLeft } from "lucide-react"

interface ClientFormProps {
    initialData?: {
        id?: string
        name: string
        ci: string
        phone?: string
        address?: string
        google_maps_link?: string
    }
    action: (formData: FormData) => Promise<void>
    title: string
    description: string
    submitLabel: string
    cancelHref: string
}

export function ClientForm({ initialData, action, title, description, submitLabel, cancelHref }: ClientFormProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                <Link href={cancelHref}>
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Cancelar
                    </Button>
                </Link>
            </div>

            <Card className="border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Datos Personales
                    </CardTitle>
                    <CardDescription>
                        Complete la información del cliente. Los campos con * son obligatorios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-6">
                        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Nombre Completo *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={initialData?.name}
                                    placeholder="EJ: JUAN PEREZ"
                                    className="uppercase transition-all focus:ring-2 focus:ring-primary/50"
                                    onInput={(e) => {
                                        e.currentTarget.value = e.currentTarget.value.toUpperCase();
                                    }}
                                />
                                <p className="text-[11px] text-muted-foreground">El nombre se convertirá automáticamente a MAYÚSCULAS.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ci" className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        Cédula de Identidad (C.I.) *
                                    </Label>
                                    <Input
                                        id="ci"
                                        name="ci"
                                        required
                                        defaultValue={initialData?.ci}
                                        placeholder="Ej: 1.234.567"
                                        className="transition-all focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Teléfono
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={initialData?.phone}
                                        placeholder="Ej: 0971 123 123"
                                        className="transition-all focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Dirección
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={initialData?.address}
                                    placeholder="Ej: Asunción, Centro"
                                    className="transition-all focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <Label htmlFor="google_maps_link" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    Ubicación (Link de Google Maps)
                                </Label>
                                <Input
                                    id="google_maps_link"
                                    name="google_maps_link"
                                    defaultValue={initialData?.google_maps_link}
                                    placeholder="Ej: https://maps.app.goo.gl/..."
                                    className="transition-all focus:ring-2 focus:ring-primary/50"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Pega el enlace de "Compartir" de Google Maps para referenciar la ubicación exacta.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <SubmitButton className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                {submitLabel}
                            </SubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

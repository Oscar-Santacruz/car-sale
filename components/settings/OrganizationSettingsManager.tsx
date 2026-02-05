'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveCollectionSettings } from "@/app/settings-actions"

interface OrganizationSettingsManagerProps {
    settings: any
}

export function OrganizationSettingsManager({ settings }: OrganizationSettingsManagerProps) {
    const [defaultPenalty, setDefaultPenalty] = useState(settings?.default_penalty_amount || 0)
    const [graceDays, setGraceDays] = useState(settings?.penalty_grace_days || 0)

    // Company Details
    const [companyName, setCompanyName] = useState(settings?.company_name || "")
    const [ruc, setRuc] = useState(settings?.ruc || "")
    const [address, setAddress] = useState(settings?.address || "")
    const [phone, setPhone] = useState(settings?.phone || "")
    const [email, setEmail] = useState(settings?.email || "")
    const [website, setWebsite] = useState(settings?.website || "")

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveCollectionSettings(
                Number(defaultPenalty),
                Number(graceDays),
                settings?.id,
                companyName,
                ruc,
                address,
                phone,
                email,
                website
            )
        } catch (error) {
            console.error("Error saving settings:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Configuración de Organización</CardTitle>
                <CardDescription>
                    Define los datos de la empresa y parámetros de cobro.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Nombre / Razón Social</Label>
                        <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ej: Miguel Laneri" />
                    </div>
                    <div className="space-y-2">
                        <Label>RUC</Label>
                        <Input value={ruc} onChange={e => setRuc(e.target.value)} placeholder="Ej: 1234567-8" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Dirección (Sucursales)</Label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Dirección de Casa Matriz y Sucursales"
                    />
                    <p className="text-[10px] text-muted-foreground">Puedes ingresar múltiples líneas.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: +595 991..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="contacto@empresa.com" />
                    </div>
                    <div className="space-y-2">
                        <Label>Sitio Web</Label>
                        <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.empresa.com" />
                    </div>
                </div>

                <div className="border-t pt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="defaultPenalty">Monto de Multa por Defecto (Gs.)</Label>
                        <Input
                            id="defaultPenalty"
                            type="text"
                            value={new Intl.NumberFormat('es-PY').format(Number(defaultPenalty))}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\D/g, '')
                                setDefaultPenalty(rawValue === '' ? 0 : Number(rawValue))
                            }}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="graceDays">Días de Gracia</Label>
                        <Input
                            id="graceDays"
                            type="number"
                            value={graceDays}
                            onChange={(e) => setGraceDays(Number(e.target.value))}
                            placeholder="0"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Configuración"}
                </Button>
            </CardFooter>
        </Card>
    )
}

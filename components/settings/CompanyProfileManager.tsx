'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveCompanyDetails } from "@/app/settings-actions"

interface CompanyProfileManagerProps {
    settings: any
}

export function CompanyProfileManager({ settings }: CompanyProfileManagerProps) {
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
            await saveCompanyDetails(
                settings?.id,
                companyName,
                ruc,
                address,
                phone,
                email,
                website
            )
        } catch (error) {
            console.error("Error saving company details:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Datos de la Empresa</CardTitle>
                <CardDescription>
                    Información que aparecerá en los recibos y documentos oficiales.
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
                    <Label>Dirección</Label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Dirección de Casa Matriz y Sucursales"
                    />
                    <p className="text-[10px] text-muted-foreground">Esta dirección se mostrará en el encabezado del recibo.</p>
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
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Datos de Empresa"}
                </Button>
            </CardFooter>
        </Card>
    )
}

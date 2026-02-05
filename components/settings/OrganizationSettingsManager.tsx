'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveOrganizationSettings } from "@/app/settings-actions"

interface OrganizationSettingsManagerProps {
    settings: any
}

export function OrganizationSettingsManager({ settings }: OrganizationSettingsManagerProps) {
    const [defaultPenalty, setDefaultPenalty] = useState(settings?.default_penalty_amount || 0)
    const [graceDays, setGraceDays] = useState(settings?.penalty_grace_days || 0)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveOrganizationSettings(Number(defaultPenalty), Number(graceDays), settings?.id)
        } catch (error) {
            console.error("Error saving settings:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Cobros</CardTitle>
                <CardDescription>
                    Define los parámetros para el cálculo de multas y moras.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <p className="text-sm text-muted-foreground">
                        Este monto se sugerirá automáticamente al cobrar una cuota vencida.
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                        Número de días después del vencimiento antes de aplicar la multa.
                    </p>
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

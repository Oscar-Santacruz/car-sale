
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateClientAction } from "@/app/actions"
import { SubmitButton } from "@/components/ui/submit-button"
import { notFound } from "next/navigation"

async function getClient(id: string) {
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

    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()

    if (error) return null
    return data
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: PageProps) {
    const { id } = await params
    const client = await getClient(id)

    if (!client) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
                <Link href={`/clients/${client.id}`}>
                    <Button variant="ghost">Cancelar</Button>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Datos Personales</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateClientAction} className="space-y-4">
                        <input type="hidden" name="id" value={client.id} />
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required defaultValue={client.name} placeholder="Ej: Juan Perez" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ci">Cédula de Identidad (C.I.)</Label>
                            <Input id="ci" name="ci" required defaultValue={client.ci} placeholder="Ej: 1.234.567" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" defaultValue={client.phone || ''} placeholder="Ej: 0971 123 123" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" name="address" defaultValue={client.address || ''} placeholder="Ej: Asunción, Centro" />
                        </div>
                        <SubmitButton className="w-full">Guardar Cambios</SubmitButton>
                        <div className="space-y-2">
                            <Label htmlFor="google_maps_link">Ubicación (Link de Google Maps)</Label>
                            <Input
                                id="google_maps_link"
                                name="google_maps_link"
                                defaultValue={client.google_maps_link || ''}
                                placeholder="Ej: https://maps.app.goo.gl/..."
                            />
                            <p className="text-[10px] text-muted-foreground">Pega aquí el enlace de "Compartir" ubicación de Google Maps.</p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}


import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil } from "lucide-react"
import { notFound } from "next/navigation"
import { ClientDocumentManager } from "@/components/clients/client-document-manager"
import { ClientSalesList } from "@/components/clients/ClientSalesList"

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

    if (error) {
        console.error("Error fetching client", error)
        return null
    }
    return data
}

async function getClientSales(clientId: string) {
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

    const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            vehicles (*),
            installments (*)
        `)
        .eq('client_id', clientId)
        .order('sale_date', { ascending: false })

    if (error) {
        console.error("Error fetching client sales", error)
        return []
    }
    return data
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
    const { id } = await params
    const client = await getClient(id)
    const sales = await getClientSales(id)

    if (!client) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/clients">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Detalle del Cliente</h2>
                </div>
                <Link href={`/clients/${client.id}/edit`}>
                    <Button>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Datos Personales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                            <p className="text-lg font-medium">{client.name}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Cédula de Identidad</p>
                            <p className="text-lg">{client.ci}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                            <p className="text-lg">{client.phone || '-'}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                            <p className="text-lg">{client.address || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ClientDocumentManager clientId={client.id} initialDocuments={client.documents} />
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <ClientSalesList sales={sales} />
            </div>
        </div>
    )
}

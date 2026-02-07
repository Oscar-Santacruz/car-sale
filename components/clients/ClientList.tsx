"use client"

import { useState } from "react"
import { LayoutGrid, List, Phone as PhoneIcon, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Client {
    id: string
    name: string | null
    ci: string | null
    phone: string | null
    address: string | null
    [key: string]: any
}

export function ClientList({ clients }: { clients: Client[] }) {
    const [view, setView] = useState<'card' | 'table'>('card')

    return (
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.length === 0 ? (
                        <div className="col-span-full text-center h-24 text-muted-foreground flex items-center justify-center border rounded-md bg-card">
                            No hay clientes registrados.
                        </div>
                    ) : (
                        clients.map((client) => (
                            <Card key={client.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {client.name}
                                    </CardTitle>
                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="text-2xl font-bold">{client.ci}</div>
                                    <div className="text-xs text-muted-foreground break-words truncate">
                                        {client.address || 'Sin dirección'}
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <PhoneIcon className="mr-1 h-3 w-3" />
                                        {client.phone || 'Sin teléfono'}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/clients/${client.id}`} className="w-full">
                                        <Button className="w-full" variant="secondary">Ver Detalles</Button>
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>C.I.</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No hay clientes registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell>{client.ci}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>{client.address}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/clients/${client.id}`}>
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
    )
}

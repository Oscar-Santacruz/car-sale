'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { User, Calendar, AlertTriangle, CheckCircle, Wallet } from "lucide-react"

type ClientResult = {
    id: string
    name: string
    ci: string
    pendingCount: number
    nearestDueDate: string | null
    totalOverdue: number
    status: 'clean' | 'overdue' | 'warning'
}

interface ClientResultsListProps {
    clients: ClientResult[]
    onSelectClient: (clientId: string) => void
    isLoading?: boolean
}

export function ClientResultsList({ clients, onSelectClient, isLoading }: ClientResultsListProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando resultados...</div>
    }

    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground h-[300px]">
                <User className="h-12 w-12 mb-4 opacity-30" />
                <p>No se encontraron clientes con los filtros seleccionados</p>
            </div>
        )
    }

    return (
        <div className="border rounded-md overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente / Vehículo</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Cuotas Pendientes</TableHead>
                        <TableHead>Próximo Vencimiento</TableHead>
                        <TableHead className="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => {
                        const isOverdue = client.status === 'overdue'

                        return (
                            <TableRow key={client.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onSelectClient(client.id)}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{client.name}</div>
                                            <div className="text-sm text-muted-foreground">CI: {client.ci}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {client.status === 'clean' && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Al Día</Badge>}
                                    {client.status === 'warning' && <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">Próximo</Badge>}
                                    {client.status === 'overdue' && <Badge variant="destructive">Mora</Badge>}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="font-bold text-lg">{client.pendingCount}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {client.nearestDueDate ? new Date(client.nearestDueDate).toLocaleDateString() : '-'}
                                    </div>
                                    {isOverdue && (
                                        <div className="text-xs text-destructive mt-1 font-medium">
                                            Vencido
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={(e) => {
                                        e.stopPropagation()
                                        onSelectClient(client.id)
                                    }}>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Plan de Pagos
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

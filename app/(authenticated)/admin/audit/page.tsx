
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { requireAdmin } from "@/lib/permissions"
import { getDeletionAuditLog } from "@/app/deletion-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecordPreviewDialog } from "@/components/audit/RecordPreviewDialog"

async function getAuditLogs() {
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

    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching audit logs", error)
        return []
    }

    if (logs.length > 0) {
        const userIds = Array.from(new Set(logs.map(log => log.user_id)))
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p]))

        return logs.map(log => ({
            ...log,
            user: profileMap.get(log.user_id)
        }))
    }

    return logs
}

export default async function AuditLogsPage() {
    try {
        await requireAdmin()
    } catch (e) {
        return <div className="p-8 text-red-500">Acceso Restringido</div>
    }

    const [logs, deletionLogsRes] = await Promise.all([
        getAuditLogs(),
        getDeletionAuditLog()
    ])

    const deletionLogs = deletionLogsRes.success ? deletionLogsRes.data : []

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Centro de Auditoría</h2>

            <Tabs defaultValue="activity" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="activity">Actividad General</TabsTrigger>
                    <TabsTrigger value="deletions">Registros de Eliminación</TabsTrigger>
                </TabsList>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Actividad (Últimos 100)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Entidad</TableHead>
                                        <TableHead>Detalles</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No hay registros de actividad.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log: any) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{log.user?.full_name || 'Desconocido'}</span>
                                                        <span className="text-xs text-muted-foreground">{log.user?.email || log.user_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                                                        log.action.includes('DEACTIVATE') ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {log.entity_type}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono max-w-[300px] truncate" title={JSON.stringify(log.details, null, 2)}>
                                                    <RecordPreviewDialog
                                                        data={log.details}
                                                        title={`Detalles: ${log.action}`}
                                                        buttonText="Ver Detalle"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deletions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Eliminaciones Físicas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Tabla</TableHead>
                                        <TableHead>ID Registro</TableHead>
                                        <TableHead>Datos Respaldados</TableHead>
                                        <TableHead>Motivo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deletionLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No hay registros de eliminación.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        deletionLogs.map((log: any) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(log.deleted_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-medium">{log.deleted_by_profile?.email || 'Sistema'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs font-bold uppercase">{log.table_name}</span>
                                                </TableCell>
                                                <TableCell className="font-mono text-[10px]">
                                                    {log.record_id.split('-')[0]}...
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <RecordPreviewDialog
                                                        data={log.record_data}
                                                        title={`Registro Borrado: ${log.table_name}`}
                                                        buttonText="Respaldado (JSON)"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-xs italic">
                                                    {log.reason || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

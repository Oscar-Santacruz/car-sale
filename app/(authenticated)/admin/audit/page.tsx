
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { requireAdmin } from "@/lib/permissions"
import { PermissionGuard } from "@/components/auth/PermissionGuard"

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

    // Fetch logs with user email info
    // Note: auth.users is not directly accessible usually, but we check permissions.
    // However, Supabase joins with auth.users might require special handling or views.
    // For now, let's just fetch logs. To get user emails, we might need a separate profile query if we don't have it in logs.
    // Assuming profiles table has emails or we stored it in the log? 
    // The audit_logs table stored user_id. We should join with profiles if profiles stores email/name.
    // Let's assume profiles has name/email or we stored it. 
    // Wait, profiles usually has `full_name` etc. Authentication email is in auth.users. 
    // We can't join auth.users easily from standard client. 
    // Strategy: Fetch logs, then fetch profiles for those user_ids.

    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching audit logs", error)
        return []
    }

    // Enhance with user profiles
    if (logs.length > 0) {
        const userIds = Array.from(new Set(logs.map(log => log.user_id)))
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email') // Assuming email is in profiles, otherwise we just show ID or Name
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
    // Ensure only admin accesses this page
    // Using simple redirect/error barrier here in addition to standard layout protection
    try {
        await requireAdmin()
    } catch (e) {
        return <div className="p-8 text-red-500">Acceso Restringido</div>
    }

    const logs = await getAuditLogs()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Auditoría de Acciones</h2>
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
                                        No hay registros de auditoría.
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
                                            {log.entity_type} <span className="text-xs text-muted-foreground">({log.entity_id.split('-')[0]}...)</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono max-w-[300px] truncate" title={JSON.stringify(log.details, null, 2)}>
                                            {JSON.stringify(log.details)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

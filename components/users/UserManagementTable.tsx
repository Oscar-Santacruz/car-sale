'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface User {
    id: string
    email: string
    role: 'admin' | 'user' | 'viewer'
    created_at: string
}

interface UserManagementTableProps {
    users: User[]
    onUpdateRole: (userId: string, newRole: 'admin' | 'user' | 'viewer') => Promise<void>
    onDeleteUser: (userId: string) => Promise<void>
}

export function UserManagementTable({ users, onUpdateRole, onDeleteUser }: UserManagementTableProps) {
    const [updating, setUpdating] = useState<string | null>(null)

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user' | 'viewer') => {
        setUpdating(userId)
        try {
            await onUpdateRole(userId, newRole)
        } catch (error) {
            console.error('Error updating role:', error)
            alert('Error al actualizar el rol')
        } finally {
            setUpdating(null)
        }
    }

    const handleDelete = async (userId: string) => {
        try {
            await onDeleteUser(userId)
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error al eliminar usuario')
        }
    }

    const getRoleBadge = (role: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            admin: 'default',
            user: 'secondary',
            viewer: 'outline'
        }
        return <Badge variant={variants[role] || 'outline'}>{role}</Badge>
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Fecha de Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                                <Select
                                    value={user.role}
                                    onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'user' | 'viewer')}
                                    disabled={updating === user.id}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                {new Date(user.created_at).toLocaleDateString('es-ES')}
                            </TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará permanentemente
                                                el usuario <strong>{user.email}</strong>.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

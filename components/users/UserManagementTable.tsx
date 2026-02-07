'use client'

import { useState, useTransition } from 'react'
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Shield, Eye, Key, Mail } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminResetUserPasswordAction, setTemporaryPasswordAction } from '@/app/user-actions'

type User = {
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
    const [isPending, startTransition] = useTransition()
    const [tempPasswordDialog, setTempPasswordDialog] = useState<{ open: boolean, user: User | null }>({ open: false, user: null })
    const [tempPassword, setTempPassword] = useState('')
    const [settingPassword, setSettingPassword] = useState(false)

    const handleRoleChange = (userId: string, newRole: string) => {
        startTransition(async () => {
            await onUpdateRole(userId, newRole as 'admin' | 'user' | 'viewer')
        })
    }

    const handleDelete = (userId: string) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            startTransition(async () => {
                await onDeleteUser(userId)
            })
        }
    }

    const handleResetPassword = async (user: User) => {
        if (confirm(`¿Enviar correo de recuperación a ${user.email}?`)) {
            try {
                await adminResetUserPasswordAction(user.id, user.email)
                toast.success('Correo de recuperación enviado exitosamente')
            } catch (error: any) {
                toast.error(error.message || 'Error al enviar correo')
            }
        }
    }

    const handleSetTempPassword = async () => {
        if (!tempPasswordDialog.user || !tempPassword) return

        const isComplex = (pwd: string) => {
            const hasUpper = /[A-Z]/.test(pwd)
            const hasLower = /[a-z]/.test(pwd)
            const hasNumber = /[0-9]/.test(pwd)
            const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
            return pwd.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial
        }

        if (!isComplex(tempPassword)) {
            toast.warning('La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.')
            return
        }

        setSettingPassword(true)
        try {
            await setTemporaryPasswordAction(tempPasswordDialog.user.id, tempPassword)
            toast.success(`Contraseña temporal establecida. El usuario deberá cambiarla en el próximo inicio de sesión.`)
            setTempPasswordDialog({ open: false, user: null })
            setTempPassword('')
        } catch (error: any) {
            toast.error(error.message || 'Error al establecer contraseña')
        } finally {
            setSettingPassword(false)
        }
    }

    const generateRandomPassword = () => {
        const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
        const lowercase = 'abcdefghjkmnpqrstuvwxyz'
        const numbers = '23456789'
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

        let password = ''
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
        password += numbers.charAt(Math.floor(Math.random() * numbers.length))
        password += special.charAt(Math.floor(Math.random() * special.length))

        const allChars = uppercase + lowercase + numbers + special
        for (let i = 4; i < 12; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length))
        }

        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('')

        setTempPassword(password)
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
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
                                        onValueChange={(value) => handleRoleChange(user.id, value)}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-3 w-3" />
                                                    Admin
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="user">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-3 w-3" />
                                                    Usuario
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="viewer">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-3 w-3" />
                                                    Visor
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString('es-PY')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleResetPassword(user)}
                                            title="Enviar correo de recuperación"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTempPasswordDialog({ open: true, user })}
                                            title="Establecer contraseña temporal"
                                        >
                                            <Key className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Temporary Password Dialog */}
            <Dialog open={tempPasswordDialog.open} onOpenChange={(open) => setTempPasswordDialog({ open, user: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Establecer Contraseña Temporal</DialogTitle>
                        <DialogDescription>
                            El usuario <strong>{tempPasswordDialog.user?.email}</strong> deberá cambiar esta contraseña en su próximo inicio de sesión.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tempPassword">Contraseña Temporal</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tempPassword"
                                    type="text"
                                    value={tempPassword}
                                    onChange={(e) => setTempPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <Button type="button" variant="outline" onClick={generateRandomPassword}>
                                    Generar
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Asegúrate de compartir esta contraseña de forma segura con el usuario.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTempPasswordDialog({ open: false, user: null })}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSetTempPassword} disabled={settingPassword || !tempPassword}>
                            {settingPassword ? 'Estableciendo...' : 'Establecer Contraseña'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldAlert } from 'lucide-react'

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isForced, setIsForced] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkForcePasswordChange()
    }, [])

    const checkForcePasswordChange = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data } = await supabase
            .from('profiles')
            .select('force_password_change')
            .eq('id', user.id)
            .single()

        setIsForced(data?.force_password_change || false)
    }

    const passwordStrength = (pass: string) => {
        if (pass.length < 8) return { strength: 'weak', label: 'Débil', color: 'text-red-500' }
        if (pass.length < 12) return { strength: 'medium', label: 'Media', color: 'text-yellow-500' }
        if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { strength: 'medium', label: 'Media', color: 'text-yellow-500' }
        return { strength: 'strong', label: 'Fuerte', color: 'text-green-500' }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        try {
            // Re-authenticate with current password
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.email) throw new Error('Usuario no encontrado')

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            })

            if (signInError) throw new Error('Contraseña actual incorrecta')

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

            // Clear force_password_change flag
            await supabase
                .from('profiles')
                .update({
                    force_password_change: false,
                    last_password_change: new Date().toISOString()
                })
                .eq('id', user.id)

            router.push('/dashboard')
        } catch (error: any) {
            setError(error.message || 'Error al cambiar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    const strength = passwordStrength(newPassword)

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/20 via-background to-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2">
                    {isForced && (
                        <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <ShieldAlert className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    )}
                    <CardTitle className="text-2xl font-bold text-center">
                        {isForced ? 'Cambio de Contraseña Requerido' : 'Cambiar Contraseña'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isForced
                            ? 'Por seguridad, debes cambiar tu contraseña antes de continuar'
                            : 'Actualiza tu contraseña de acceso'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showPasswords ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input
                                id="newPassword"
                                type={showPasswords ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="h-11"
                                placeholder="Mínimo 8 caracteres"
                            />
                            {newPassword && (
                                <p className={`text-xs ${strength.color}`}>
                                    Seguridad: {strength.label}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type={showPasswords ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="rounded-md bg-muted p-3 text-xs space-y-1">
                            <p className="font-medium">Requisitos:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                <li>Mínimo 8 caracteres</li>
                                <li>Recomendado: mayúsculas, minúsculas y números</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cambiando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </Button>

                        {!isForced && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

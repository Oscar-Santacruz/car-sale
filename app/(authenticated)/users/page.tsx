import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { getUsersAction, updateUserRoleAction, deleteUserAction } from '@/app/user-actions'
import { UserManagementTable } from '@/components/users/UserManagementTable'
import { isAdmin } from '@/lib/permissions'

export default async function UsersPage() {
    const isUserAdmin = await isAdmin()

    const users = isUserAdmin ? await getUsersAction() : []

    return (
        <PermissionGuard requiredRole="admin">
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra los usuarios y sus permisos
                    </p>
                </div>

                <UserManagementTable
                    users={users}
                    onUpdateRole={updateUserRoleAction}
                    onDeleteUser={deleteUserAction}
                />
            </div>
        </PermissionGuard>
    )
}

import { getParametricData } from "@/app/settings-actions"
import SettingsTabs from "@/components/settings/SettingsTabs"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const data = await getParametricData()

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                    <p className="text-muted-foreground">
                        Administra los parámetros y catálogos del sistema.
                    </p>
                </div>
            </div>

            <SettingsTabs data={data} />
        </div>
    )
}

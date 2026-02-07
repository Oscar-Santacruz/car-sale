import { BulkInventoryImport } from "@/components/inventory/BulkInventoryImport"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BulkImportInventoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/inventory">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Carga Masiva de Inventario</h2>
                    <p className="text-muted-foreground">
                        Importa múltiples vehículos desde un archivo Excel o CSV
                    </p>
                </div>
            </div>

            <BulkInventoryImport />
        </div>
    )
}

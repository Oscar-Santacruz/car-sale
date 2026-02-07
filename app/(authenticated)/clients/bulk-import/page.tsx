import { BulkClientImport } from "@/components/clients/BulkClientImport"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BulkImportPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Carga Masiva de Clientes</h2>
                    <p className="text-muted-foreground">
                        Importa múltiples clientes desde un archivo Excel o CSV
                    </p>
                </div>
            </div>

            <BulkClientImport />
        </div>
    )
}

'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { bulkImportVehiclesAction } from "@/app/inventory-actions"

interface ImportResult {
    success: number
    errors: { row: number; error: string }[]
}

export function BulkInventoryImport() {
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [showPreview, setShowPreview] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            // Leer archivo Excel/CSV
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            if (jsonData.length === 0) {
                toast.error('El archivo está vacío')
                return
            }

            if (jsonData.length > 500) {
                toast.error('Máximo 500 vehículos por carga')
                return
            }

            // Convertir a objetos planos y mostrar preview
            const plainData = jsonData.map((row: any) => ({
                cod: row.cod || '',
                chassis: row.chassis || '',
                brand: row.brand || row.marca || '',
                model: row.model || row.modelo || '',
                year: row.year || row.año || new Date().getFullYear(),
                color: row.color || '',
                motor: row.motor || '',
                list_price: row.list_price || row.precio_lista || 0,
                status: row.status || row.estado || 'available'
            }))

            setPreviewData(plainData)
            setShowPreview(true)
            setResult(null)
        } catch (error: any) {
            toast.error('Error al procesar el archivo: ' + error.message)
        } finally {
            // Reset input
            e.target.value = ''
        }
    }

    const handleConfirmImport = async () => {
        setImporting(true)
        setShowPreview(false)

        try {
            // Llamar a server action con datos planos
            const importResult = await bulkImportVehiclesAction(previewData)
            if (importResult.success > 0) {
                toast.success(`${importResult.success} vehículos importados`)
            }
            if (importResult.errors.length > 0) {
                toast.warning(`Se encontraron ${importResult.errors.length} errores`)
            }
            setResult(importResult)
            setPreviewData([])
        } catch (error: any) {
            toast.error('Error al importar: ' + error.message)
        } finally {
            setImporting(false)
        }
    }

    const handleCancelPreview = () => {
        setShowPreview(false)
        setPreviewData([])
    }

    const downloadTemplate = () => {
        const template = [
            {
                cod: "V001",
                chassis: "ABC123456",
                brand: "Toyota",
                model: "Corolla",
                year: 2024,
                color: "Blanco",
                motor: "1.8L",
                list_price: 150000000,
                status: "available"
            },
            {
                cod: "V002",
                chassis: "XYZ789012",
                brand: "Honda",
                model: "Civic",
                year: 2023,
                color: "Negro",
                motor: "2.0L",
                list_price: 180000000,
                status: "available"
            }
        ]

        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Vehículos")
        XLSX.writeFile(wb, "plantilla_inventario.xlsx")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carga Masiva de Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" /> Descargar Plantilla
                    </Button>
                    <label htmlFor="file-upload">
                        <Button variant="default" asChild disabled={importing}>
                            <span>
                                <Upload className="mr-2 h-4 w-4" />
                                {importing ? 'Procesando...' : 'Cargar Excel/CSV'}
                            </span>
                        </Button>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">Columnas requeridas:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li><strong>cod</strong> - Código del vehículo (requerido, único)</li>
                        <li><strong>chassis</strong> - Número de chasis (requerido)</li>
                        <li><strong>brand</strong> - Marca (requerido)</li>
                        <li><strong>model</strong> - Modelo (requerido)</li>
                        <li><strong>year</strong> - Año (requerido)</li>
                        <li><strong>color</strong> - Color (opcional)</li>
                        <li><strong>motor</strong> - Motor (opcional)</li>
                        <li><strong>list_price</strong> - Precio de lista (requerido)</li>
                        <li><strong>status</strong> - Estado: available/sold (opcional, default: available)</li>
                    </ul>
                </div>

                {showPreview && previewData.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Vista Previa</h3>
                                <p className="text-sm text-muted-foreground">
                                    {previewData.length} vehículo{previewData.length !== 1 ? 's' : ''} para importar
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleCancelPreview}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleConfirmImport} disabled={importing}>
                                    {importing ? 'Importando...' : 'Confirmar Importación'}
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-md max-h-96 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left font-medium">#</th>
                                        <th className="p-2 text-left font-medium">COD</th>
                                        <th className="p-2 text-left font-medium">Chasis</th>
                                        <th className="p-2 text-left font-medium">Marca</th>
                                        <th className="p-2 text-left font-medium">Modelo</th>
                                        <th className="p-2 text-left font-medium">Año</th>
                                        <th className="p-2 text-left font-medium">Color</th>
                                        <th className="p-2 text-right font-medium">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 100).map((vehicle, idx) => (
                                        <tr key={idx} className="border-t hover:bg-muted/50">
                                            <td className="p-2 text-muted-foreground">{idx + 1}</td>
                                            <td className="p-2">{vehicle.cod || '-'}</td>
                                            <td className="p-2">{vehicle.chassis || '-'}</td>
                                            <td className="p-2">{vehicle.brand || '-'}</td>
                                            <td className="p-2">{vehicle.model || '-'}</td>
                                            <td className="p-2">{vehicle.year || '-'}</td>
                                            <td className="p-2">{vehicle.color || '-'}</td>
                                            <td className="p-2 text-right">Gs. {Number(vehicle.list_price || 0).toLocaleString('es-PY')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 100 && (
                                <div className="p-3 text-center text-sm text-muted-foreground bg-muted/50">
                                    Mostrando primeros 100 de {previewData.length} vehículos
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {result && (
                    <div className="space-y-3 border-t pt-4">
                        {result.success > 0 && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">
                                    {result.success} vehículo{result.success !== 1 ? 's' : ''} importado{result.success !== 1 ? 's' : ''} exitosamente
                                </span>
                            </div>
                        )}

                        {result.errors.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                                    <XCircle className="h-5 w-5" />
                                    <span className="font-medium">
                                        {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''}
                                    </span>
                                </div>
                                <div className="bg-muted p-3 rounded-md max-h-48 overflow-y-auto">
                                    <ul className="text-sm space-y-1">
                                        {result.errors.map((err, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                                                <span>
                                                    <strong>Fila {err.row}:</strong> {err.error}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { bulkImportClientsAction } from '@/app/client-actions'

interface ImportResult {
    success: number
    errors: Array<{ row: number; error: string }>
}

export function BulkClientImport() {
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

            if (jsonData.length > 1000) {
                toast.error('Máximo 1000 clientes por carga')
                return
            }

            // Convertir a objetos planos y mostrar preview
            const plainData = jsonData.map((row: any) => ({
                nombre: row.nombre || '',
                ci: row.ci || '',
                telefono: row.telefono || '',
                direccion: row.direccion || '',
                email: row.email || ''
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
            const importResult = await bulkImportClientsAction(previewData)
            if (importResult.success > 0) {
                toast.success(`${importResult.success} clientes importados`)
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
                nombre: 'Juan Pérez',
                ci: '1234567',
                telefono: '0981123456',
                direccion: 'Asunción',
                email: 'juan@example.com'
            },
            {
                nombre: 'María González',
                ci: '7654321',
                telefono: '0982654321',
                direccion: 'Luque',
                email: 'maria@example.com'
            }
        ]
        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
        XLSX.writeFile(wb, 'plantilla_clientes.xlsx')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carga Masiva de Clientes</CardTitle>
                <CardDescription>
                    Importa múltiples clientes desde un archivo Excel o CSV
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Plantilla
                    </Button>
                    <label className="cursor-pointer">
                        <Button disabled={importing} asChild>
                            <span>
                                <Upload className="mr-2 h-4 w-4" />
                                {importing ? 'Importando...' : 'Cargar Excel/CSV'}
                            </span>
                        </Button>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Columnas requeridas:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                        <li><code>nombre</code> - Nombre completo (requerido)</li>
                        <li><code>ci</code> - Cédula de identidad (requerido, único)</li>
                        <li><code>telefono</code> - Teléfono (opcional)</li>
                        <li><code>direccion</code> - Dirección (opcional)</li>
                        <li><code>email</code> - Email (opcional)</li>
                    </ul>
                </div>

                {showPreview && previewData.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Vista Previa</h3>
                                <p className="text-sm text-muted-foreground">
                                    {previewData.length} cliente{previewData.length !== 1 ? 's' : ''} para importar
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
                                        <th className="p-2 text-left font-medium">Nombre</th>
                                        <th className="p-2 text-left font-medium">CI</th>
                                        <th className="p-2 text-left font-medium">Teléfono</th>
                                        <th className="p-2 text-left font-medium">Dirección</th>
                                        <th className="p-2 text-left font-medium">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 100).map((client, idx) => (
                                        <tr key={idx} className="border-t hover:bg-muted/50">
                                            <td className="p-2 text-muted-foreground">{idx + 1}</td>
                                            <td className="p-2">{client.nombre || '-'}</td>
                                            <td className="p-2">{client.ci || '-'}</td>
                                            <td className="p-2">{client.telefono || '-'}</td>
                                            <td className="p-2">{client.direccion || '-'}</td>
                                            <td className="p-2">{client.email || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 100 && (
                                <div className="p-3 text-center text-sm text-muted-foreground bg-muted/50">
                                    Mostrando primeros 100 de {previewData.length} clientes
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
                                    {result.success} cliente{result.success !== 1 ? 's' : ''} importado{result.success !== 1 ? 's' : ''} exitosamente
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

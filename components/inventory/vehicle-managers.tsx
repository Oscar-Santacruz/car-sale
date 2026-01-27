
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink } from "lucide-react"
import { FileUploader } from "@/components/ui/file-uploader"

export function VehicleGalleryManager({ vehicleId, initialImages }: { vehicleId: string, initialImages: string[] }) {
    const [images, setImages] = useState(initialImages || [])
    const router = useRouter()
    const supabase = createClient()

    const handleUploadBatch = async (urls: string[]) => {
        const newImages = [...images, ...urls]

        await supabase.from('vehicles').update({ images: newImages }).eq('id', vehicleId)

        setImages(newImages)
        router.refresh()
    }

    const handleDelete = async (index: number) => {
        if (!confirm("¿Eliminar imagen?")) return
        const newImages = images.filter((_, i) => i !== index)

        await supabase.from('vehicles').update({ images: newImages }).eq('id', vehicleId)

        setImages(newImages)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-md border overflow-hidden group">
                        <img src={url} alt={`Vehicle ${index}`} className="object-cover w-full h-full" />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(index)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
                <div className="flex items-center justify-center rounded-md border border-dashed p-4 min-h-[120px]">
                    <FileUploader
                        bucket="vehicles"
                        onUploadComplete={() => { }} // Not used in multiple mode
                        onBatchUploadComplete={handleUploadBatch}
                        className="w-full"
                        multiple={true}
                    />
                </div>
            </div>
        </div>
    )
}

export function VehicleDocumentManager({ vehicleId, initialDocuments }: { vehicleId: string, initialDocuments: any }) {
    const [documents, setDocuments] = useState(initialDocuments || {})
    const router = useRouter()
    const supabase = createClient()

    const handleUpload = async (url: string, type: string) => {
        const newDocuments = { ...documents, [type]: url }
        await supabase.from('vehicles').update({ documents: newDocuments }).eq('id', vehicleId)
        setDocuments(newDocuments)
        router.refresh()
    }

    const handleDelete = async (type: string) => {
        if (!confirm("¿Eliminar documento?")) return
        const newDocuments = { ...documents }
        delete newDocuments[type]
        await supabase.from('vehicles').update({ documents: newDocuments }).eq('id', vehicleId)
        setDocuments(newDocuments)
        router.refresh()
    }

    const docTypes = [
        { key: 'title', label: 'Título de Propiedad' },
        { key: 'green_card', label: 'Cédula Verde' },
        { key: 'purchase_invoice', label: 'Factura de Compra' }
    ]

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                {docTypes.map((doc) => (
                    <div key={doc.key} className="flex items-center justify-between rounded-md border p-3">
                        <span className="text-sm font-medium">{doc.label}</span>
                        <div className="flex items-center gap-2">
                            {documents[doc.key] ? (
                                <>
                                    <a href={documents[doc.key]} target="_blank" rel="noreferrer">
                                        <Button variant="ghost" size="sm">
                                            <ExternalLink className="h-4 w-4 mr-2" /> Ver
                                        </Button>
                                    </a>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.key)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </>
                            ) : (
                                <FileUploader
                                    bucket="vehicles"
                                    onUploadComplete={(url) => handleUpload(url, doc.key)}
                                    className="w-[200px]"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

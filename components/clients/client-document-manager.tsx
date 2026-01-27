
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink } from "lucide-react"
import { FileUploader } from "@/components/ui/file-uploader"

export function ClientDocumentManager({ clientId, initialDocuments }: { clientId: string, initialDocuments: any }) {
    const [documents, setDocuments] = useState(initialDocuments || {})
    const router = useRouter()
    const supabase = createClient()

    const handleUpload = async (url: string, type: string) => {
        const newDocuments = { ...documents, [type]: url }

        // Update in DB
        const { error } = await supabase
            .from('clients')
            .update({ documents: newDocuments })
            .eq('id', clientId)

        if (error) {
            console.error("Error updating documents:", error)
            alert("Error al guardar el documento.")
            return
        }

        setDocuments(newDocuments)
        router.refresh()
    }

    const handleDelete = async (type: string) => {
        if (!confirm("¿Estás seguro de eliminar este documento?")) return

        const newDocuments = { ...documents }
        delete newDocuments[type]

        const { error } = await supabase
            .from('clients')
            .update({ documents: newDocuments })
            .eq('id', clientId)

        if (error) {
            console.error("Error deleting document:", error)
            alert("Error al eliminar el documento.")
            return
        }

        setDocuments(newDocuments)
        router.refresh()
    }

    const docTypes = [
        { key: 'id_front', label: 'Cédula (Frente)' },
        { key: 'id_back', label: 'Cédula (Dorso)' },
        { key: 'proof_address', label: 'Comprobante Domicilio' },
        { key: 'other', label: 'Otro Documento' }
    ]

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {docTypes.map((doc) => (
                    <div key={doc.key} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{doc.label}</h4>
                            {documents[doc.key] && (
                                <div className="flex gap-2">
                                    <a href={documents[doc.key]} target="_blank" rel="noreferrer">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(doc.key)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {documents[doc.key] ? (
                            <div className="relative aspect-video rounded-md overflow-hidden bg-muted border">
                                {/* Simple preview if image, or generic icon */}
                                <img
                                    src={documents[doc.key]}
                                    alt={doc.label}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-muted-foreground"><svg .../> Documento</span>'
                                    }}
                                />
                            </div>
                        ) : (
                            <FileUploader
                                bucket="clients"
                                onUploadComplete={(url) => handleUpload(url, doc.key)}
                                className="w-full"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

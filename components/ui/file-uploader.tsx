
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, FileIcon, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
    bucket: string
    onUploadComplete: (url: string) => void
    onBatchUploadComplete?: (urls: string[]) => void
    acceptedFileTypes?: string
    className?: string
    multiple?: boolean
}

export function FileUploader({ bucket, onUploadComplete, onBatchUploadComplete, acceptedFileTypes = "image/*", className, multiple = false }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files)
            setFiles(selectedFiles)

            const newPreviews = selectedFiles.map(file => {
                if (file.type.startsWith('image/')) {
                    return URL.createObjectURL(file)
                }
                return null
            }).filter(url => url !== null) as string[]

            setPreviews(newPreviews)
        }
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        try {
            setUploading(true)
            const supabase = createClient()
            const uploadedUrls: string[] = []

            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file)

                if (uploadError) {
                    throw uploadError
                }

                const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
                uploadedUrls.push(data.publicUrl)
            }

            if (multiple && onBatchUploadComplete) {
                onBatchUploadComplete(uploadedUrls)
            } else if (uploadedUrls.length > 0) {
                onUploadComplete(uploadedUrls[0])
            }

            clearFiles()
        } catch (error: any) {
            console.error('Error uploading file:', error)
            alert('Error al subir el archivo: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const clearFiles = () => {
        setFiles([])
        setPreviews([])
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-4">
                <Input
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="flex-1"
                    multiple={multiple}
                />
                <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" /> Subir {files.length > 1 ? `(${files.length})` : ''}
                        </>
                    )}
                </Button>
            </div>

            {files.length > 0 && (
                <div className="relative rounded-md border p-4 bg-muted/20">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 z-10"
                        onClick={clearFiles}
                        disabled={uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <div className="flex flex-wrap gap-4">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-4 min-w-[200px]">
                                {file.type.startsWith('image/') ? (
                                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                                        <div className="absolute inset-0">
                                            {/* Using img native for local preview buffer */}
                                            <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-md border bg-muted">
                                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-medium text-sm max-w-[150px]">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

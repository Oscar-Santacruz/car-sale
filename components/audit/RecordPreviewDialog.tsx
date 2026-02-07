'use client'

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface RecordPreviewDialogProps {
    data: any
    title?: string
    buttonText?: string
}

export function RecordPreviewDialog({
    data,
    title = "Vista Previa de Datos",
    buttonText = "Ver JSON"
}: RecordPreviewDialogProps) {
    if (!data) return <span className="text-muted-foreground italic text-[10px]">Sin datos</span>

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                    <Eye className="h-3 w-3 mr-1" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-4 bg-slate-950 rounded-md font-mono text-[11px] text-emerald-400 whitespace-pre scrollbar-thin">
                    {JSON.stringify(data, null, 2)}
                </div>
            </DialogContent>
        </Dialog>
    )
}

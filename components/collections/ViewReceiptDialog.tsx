'use client'

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Printer, Eye } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Receipt } from "./Receipt"

interface ViewReceiptDialogProps {
    payment: any
    client: any
    sale: any
    installmentNumber: number
    settings?: any
}

export function ViewReceiptDialog({ payment, client, sale, installmentNumber, settings }: ViewReceiptDialogProps) {
    const receiptRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handlePrint = () => {
        const content = receiptRef.current
        if (!content) return

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Recibo</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @page { size: auto; margin: 0mm; }
                            body { margin: 20mm; }
                        </style>
                    </head>
                    <body>
                        ${content.outerHTML}
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.focus()
            setTimeout(() => {
                printWindow.print()
                printWindow.close()
            }, 500)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Recibo
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[1200px] !w-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Recibo de Pago</span>
                        <Button size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Receipt
                        ref={receiptRef}
                        payment={payment}
                        client={client}
                        sale={sale}
                        installmentNumber={installmentNumber}
                        settings={settings}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

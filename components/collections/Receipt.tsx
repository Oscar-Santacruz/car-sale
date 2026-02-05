import React from 'react'
import { formatCurrency } from "@/lib/utils"
import { numberToWords } from "@/lib/number-to-words"
/* eslint-disable @next/next/no-img-element */

type ReceiptProps = {
    payment: {
        id?: string
        receipt_number: string
        amount: number
        penalty_amount: number
        created_at: string
        payment_method: string
        comment?: string
    }
    client: {
        name: string
        ci: string
    }
    sale: {
        vehicle_brand: string
        vehicle_model: string
        vehicle_plate: string
    }
    installmentNumber: string | number
    settings?: {
        company_name?: string
        ruc?: string
        address?: string
        phone?: string
        email?: string
        website?: string
    }
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ payment, client, sale, installmentNumber, settings }, ref) => {
    return (
        <div ref={ref} className="p-8 w-full max-w-[26cm] mx-auto bg-white text-black font-sans text-xs" style={{ minHeight: '14cm' }}>
            {/* Header */}
            <div className="flex flex-row justify-between gap-6 mb-4 border-2 border-black p-4">
                {/* Left: Company Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex gap-6 items-start">
                        <img src="/LOGO.png" alt="Logo" className="h-20 w-auto object-contain flex-shrink-0" />
                        <div className="flex-1 space-y-1 min-w-0">
                            <h1 className="text-2xl font-black uppercase tracking-wide text-blue-900 leading-none truncate">
                                {settings?.company_name || 'MIGUEL LANERI'}
                            </h1>
                            <div className="text-[11px] text-gray-700 font-medium">
                                {settings?.address?.split('\n').map((line, i) => (
                                    <span key={i} className="block">{line}</span>
                                )) || 'Dirección no configurada'}
                            </div>
                            <div className="text-[11px] space-y-0.5 mt-2 text-gray-600">
                                {settings?.website && <p>Web: {settings.website}</p>}
                                {settings?.email && <p>Email: {settings.email}</p>}
                                {settings?.phone && <p>Tel: {settings.phone}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: RUC / Timbrado */}
                <div className="w-[280px] border-l-2 border-black pl-6 flex flex-col justify-center text-center space-y-1 flex-shrink-0">
                    <p className="font-bold text-lg">RUC: {settings?.ruc || '3825728-9'}</p>
                    <h2 className="text-xl font-bold bg-gray-100 py-1">RECIBO DE DINERO</h2>
                    <p className="font-mono text-lg">{payment.receipt_number}</p>
                </div>
            </div>

            {/* Date & Condition */}
            <div className="flex border-2 border-black mb-2 divide-x-2 divide-black">
                <div className="flex-1 p-2 flex gap-2 items-center">
                    <span className="font-bold">FECHA DE EMISION:</span>
                    <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex-1 p-2 flex gap-2 items-center justify-end">
                    <span className="font-bold">CONDICION DE VENTA:</span>
                    <span className="px-2">Contado [X]</span>
                    <span className="px-2">Crédito [ ]</span>
                </div>
            </div>

            {/* Client Info */}
            <div className="border-2 border-black mb-4 p-2 space-y-2">
                <div className="flex gap-2">
                    <span className="font-bold w-48">DOCUMENTO DE IDENTIDAD:</span>
                    <span>{client.ci}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-bold w-48">NOMBRE O RAZON SOCIAL:</span>
                    <span>{client.name}</span>
                </div>
            </div>

            {/* Details Table */}
            <div className="border-2 border-black mb-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-black divide-x-2 divide-black bg-gray-50 text-center">
                            <th className="p-1 w-12">Cant.</th>
                            <th className="p-1">CLASE DE MERCADERIAS Y/O SERVICIOS</th>
                            <th className="p-1 w-24">PRECIO UNITARIO</th>
                            <th className="p-1 w-24">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                        <tr className="divide-x divide-black">
                            <td className="p-1 text-center">1</td>
                            <td className="p-1">
                                Pago de Cuota N° {installmentNumber} -
                                {sale.vehicle_brand} {sale.vehicle_model} ({sale.vehicle_plate})
                                {payment.comment && <div className="text-[10px] italic mt-1">Obs: {payment.comment}</div>}
                            </td>
                            <td className="p-1 text-right">{formatCurrency(payment.amount - (payment.penalty_amount || 0))}</td>
                            <td className="p-1 text-right">{formatCurrency(payment.amount - (payment.penalty_amount || 0))}</td>
                        </tr>
                        {(payment.penalty_amount || 0) > 0 && (
                            <tr className="divide-x divide-black">
                                <td className="p-1 text-center">1</td>
                                <td className="p-1">Multa / Intereses por mora</td>
                                <td className="p-1 text-right">{formatCurrency(payment.penalty_amount)}</td>
                                <td className="p-1 text-right">{formatCurrency(payment.penalty_amount)}</td>
                            </tr>
                        )}
                        {/* Empty Spacer Rows to fill height if needed, roughly matching image style */}
                        <tr className="divide-x divide-black h-8">
                            <td></td><td></td><td></td><td></td>
                        </tr>
                    </tbody>
                    <tfoot className="border-t-2 border-black">
                        <tr className="divide-x divide-black font-bold bg-gray-100">
                            <td colSpan={3} className="p-1 text-right">TOTAL A PAGAR</td>
                            <td className="p-1 text-right">{formatCurrency(payment.amount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer with Amount in Words (Placeholder) */}
            <div className="border-2 border-black border-t-0 p-2 mb-4">
                <p className="italic uppercase">Son: Guaraníes {numberToWords(payment.amount)}.-</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center mt-12">
                <div className="border-t border-black mx-12 pt-2">
                    <p>FIRMA DEL CLIENTE</p>
                    <p className="text-[10px]">Aclaración:</p>
                </div>
                <div className="border-t border-black mx-12 pt-2">
                    <p>POR MIGUEL LANERI</p>
                    <p className="text-[10px]">{settings?.company_name}</p>
                </div>
            </div>

            <div className="text-[10px] text-right mt-4">
                <p>ORIGINAL: CLIENTE / COPIA: ARCHIVO</p>
            </div>
        </div>
    )
})

Receipt.displayName = "Receipt"

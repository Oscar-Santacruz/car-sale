import React from 'react'
import { formatCurrency } from "@/lib/utils"

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
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ payment, client, sale, installmentNumber }, ref) => {
    return (
        <div ref={ref} className="p-8 max-w-2xl mx-auto bg-white text-black font-sans" style={{ minHeight: '14cm' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">Recibo de Dinero</h1>
                <p className="text-sm">Comprobante de Pago</p>
                <div className="mt-2 text-right">
                    <span className="font-mono text-lg">N° {payment.receipt_number}</span>
                </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500">Fecha</label>
                    <p>{new Date(payment.created_at).toLocaleDateString()} {new Date(payment.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                    <label className="block text-xs font-bold uppercase text-gray-500">Monto Total</label>
                    <p className="text-xl font-bold">{formatCurrency(payment.amount)}</p>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-500">Recibimos de</label>
                <p className="text-lg border-b border-dotted border-gray-300 py-1">{client.name}</p>
                <p className="text-sm text-gray-600">CI/RUC: {client.ci}</p>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-500">Concepto</label>
                <p className="py-1">
                    Pago de Cuota N° <strong>{installmentNumber}</strong> <br />
                    Vehículo: {sale.vehicle_brand} {sale.vehicle_model} - Chapa: {sale.vehicle_plate}
                </p>
            </div>

            {/* Details Table */}
            <table className="w-full mb-8 border-collapse">
                <thead>
                    <tr className="border-b border-black">
                        <th className="text-left py-2 text-sm">Descripción</th>
                        <th className="text-right py-2 text-sm">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-200">
                        <td className="py-2">Cuota Capital</td>
                        <td className="text-right py-2">{formatCurrency(payment.amount - (payment.penalty_amount || 0))}</td>
                    </tr>
                    {(payment.penalty_amount || 0) > 0 && (
                        <tr className="border-b border-gray-200">
                            <td className="py-2">Multa / Intereses</td>
                            <td className="text-right py-2">{formatCurrency(payment.penalty_amount)}</td>
                        </tr>
                    )}
                    <tr className="font-bold">
                        <td className="py-2 text-right">TOTAL PAGADO</td>
                        <td className="text-right py-2">{formatCurrency(payment.amount)}</td>
                    </tr>
                </tbody>
            </table>

            {payment.comment && (
                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-500">Observaciones</label>
                    <p className="text-sm italic">{payment.comment}</p>
                </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 mt-20">
                <div className="text-center pt-8 border-t border-black">
                    <p className="text-sm">Entregué Conforme</p>
                </div>
                <div className="text-center pt-8 border-t border-black">
                    <p className="text-sm">Recibí Conforme</p>
                    <p className="text-xs text-gray-500 mt-1">Por la Empresa</p>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Generado automáticamente por el sistema
            </div>
        </div>
    )
})

Receipt.displayName = "Receipt"

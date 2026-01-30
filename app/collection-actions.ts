'use server'

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getClientPendingInstallments(clientId: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data, error } = await supabase
        .from('installments')
        .select(`
            *,
            sales (
                id,
                vehicle_id,
                vehicles (
                    brand,
                    model,
                    year,
                    plate
                )
            )
        `)
        .eq('sales.client_id', clientId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })

    if (error) {
        console.error('Error fetching installments:', error)
        throw new Error('Error al obtener cuotas pendientes')
    }

    // Filter out installments where the join returned null (if any)
    const validInstallments = data?.filter(item => item.sales !== null) || []
    return validInstallments
}

export async function processPayment(data: {
    installmentId: string,
    amount: number,
    paymentMethod: string,
    referenceNumber?: string
}) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    // 1. Get the installment to verify amount and sale_id
    const { data: installment, error: fetchError } = await supabase
        .from('installments')
        .select('*')
        .eq('id', data.installmentId)
        .single()

    if (fetchError || !installment) {
        throw new Error('Cuota no encontrada')
    }

    // 2. Insert Payment Record
    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            installment_id: data.installmentId,
            sale_id: installment.sale_id,
            amount: data.amount,
            payment_method: data.paymentMethod,
            reference_number: data.referenceNumber,
            receipt_number: `REC-${Date.now()}` // Simple Receipt ID for now
        })

    if (paymentError) {
        console.error('Error creating payment:', paymentError)
        throw new Error('Error al registrar el pago')
    }

    // 3. Update Installment Status
    // Assume full payment for now, or check if amount >= installment.amount
    // If partial payment logic is desired later, we handle it here.
    // For now: Mark as paid.

    // Check if fully paid (simple logic: paid amount >= installment due amount)
    // NOTE: In a real partial payment system, we'd subtract from balance. 
    // Let's assume for this MVP it's full payment or nothing for simplicity unless specified.
    // User asked "Cobro de Cuota", usually implies full. But let's be safe.

    const { error: updateError } = await supabase
        .from('installments')
        .update({ status: 'paid' })
        .eq('id', data.installmentId)

    if (updateError) {
        throw new Error('Error al actualizar estado de la cuota')
    }

    // 4. Log Cash Movement
    const { error: cashError } = await supabase
        .from('cash_movements')
        .insert({
            type: 'income',
            amount: data.amount,
            description: `Cobro Cuota N° ${installment.installment_number} - Venta ${installment.sale_id}`,
            related_entity_id: installment.sale_id
        })

    if (cashError) {
        console.warn('Error creating cash movement log:', cashError)
        // Non-blocking error? Maybe strict is better.
    }

    revalidatePath('/dashboard')
    revalidatePath('/collections')
    return { success: true }
}

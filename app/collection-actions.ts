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

type PaymentData = {
    installmentId: string | null;
    saleId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    penaltyAmount?: number;
    comment?: string;
    bankAccountId?: string;
}

export async function processPayment(data: PaymentData) {
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

    // 1. Insert Payment
    const { data: insertedPayment, error: paymentError } = await supabase.from('payments').insert({
        sale_id: data.saleId,
        installment_id: data.installmentId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        reference_number: data.referenceNumber,
        penalty_amount: data.penaltyAmount || 0,
        comment: data.comment,
        bank_account_id: data.bankAccountId
    }).select().single()

    if (paymentError) {
        throw new Error(`Error registering payment: ${paymentError.message}`)
    }

    // 2. Update Installment Status if applicable
    let installmentNumber = "N/A"
    if (data.installmentId) {
        const { data: inst } = await supabase.from('installments').select('number').eq('id', data.installmentId).single()
        installmentNumber = inst?.number || "N/A"

        await supabase.from('installments').update({
            status: 'paid'
        }).eq('id', data.installmentId)
    }

    // 3. Update Sale Balance
    const amountToReduceParams = data.amount - (data.penaltyAmount || 0)
    const amountToReduce = amountToReduceParams > 0 ? amountToReduceParams : 0

    const { data: sale } = await supabase.from('sales').select('balance').eq('id', data.saleId).single()
    if (sale) {
        const newBalance = sale.balance - amountToReduce
        await supabase.from('sales').update({ balance: newBalance }).eq('id', data.saleId)
    }

    // 4. Log Cash Movement
    const { error: cashError } = await supabase
        .from('cash_movements')
        .insert({
            type: 'income',
            amount: data.amount,
            description: `Cobro Cuota N° ${installmentNumber} - Venta ${data.saleId} ${data.penaltyAmount ? `(Incl. Multa: ${data.penaltyAmount})` : ''}`,
            related_entity_id: data.saleId
        })

    if (cashError) {
        console.warn('Error creating cash movement log:', cashError)
    }

    revalidatePath(`/collections/${data.saleId}`)
    revalidatePath('/collections')
    return { success: true, payment: insertedPayment }
}

// ... imports

export type ClientSummary = {
    id: string
    name: string
    ci: string
    pendingCount: number
    nearestDueDate: string | null
    totalOverdue: number
    status: 'clean' | 'overdue' | 'warning'
}

export async function getClientsWithPendingSummary(): Promise<ClientSummary[]> {
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

    // Fetch clients with their pending installments
    // We want ALL clients, but we also want to know about their debt.
    // If a client has no debt, they might still appear but with status 'clean'.
    const { data: clients, error } = await supabase
        .from('clients')
        .select(`
            id,
            name,
            ci,
            sales:sales!sales_client_id_fkey (
                id,
                installments (
                    id,
                    amount,
                    due_date,
                    status
                )
            )
        `)
        .order('name')

    if (error) {
        console.error('Error fetching clients summary:', JSON.stringify(error, null, 2))
        throw new Error(`Error al obtener el resumen de clientes: ${error.message || JSON.stringify(error)}`)
    }

    // Process data to flat summary
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const summary = clients.map(client => {
        let pendingCount = 0
        let totalOverdue = 0
        let nearestDueDate: Date | null = null
        let hasOverdue = false

        client.sales?.forEach((sale: any) => {
            sale.installments?.forEach((inst: any) => {
                if (inst.status === 'pending') {
                    pendingCount++
                    const due = new Date(inst.due_date)

                    if (!nearestDueDate || due < nearestDueDate) {
                        nearestDueDate = due
                    }

                    if (due < today) {
                        hasOverdue = true
                        totalOverdue += inst.amount // Only overdue amount
                    }
                }
            })
        })

        // Determine Status
        let status: 'clean' | 'overdue' | 'warning' = 'clean'
        if (hasOverdue) {
            status = 'overdue'
        } else if (pendingCount > 0) {
            // Check if due soon (e.g. within 7 days)
            if (nearestDueDate) {
                const nd = nearestDueDate as Date
                const diffTime = nd.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                if (diffDays <= 7) {
                    status = 'warning'
                }
            }
        }

        return {
            id: client.id,
            name: client.name,
            ci: client.ci,
            pendingCount,
            nearestDueDate: nearestDueDate ? (nearestDueDate as Date).toISOString() : null,
            totalOverdue,
            status
        }
    })

    return summary
}

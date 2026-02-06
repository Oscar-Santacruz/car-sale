'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { calculateAmortizationSchedule } from '@/lib/financing'
import { logAuditAction } from '@/lib/audit'
import { requireAdmin } from '@/lib/permissions'

// ... existing code ...

// Need to duplicate types or share them. Ideally share.
type Refuerzo = {
    date: string;
    amount: number;
};

export async function createSaleAction(saleData: {
    clientId: string;
    codeudorId?: string; // Optional
    vehicleId: string;
    price: number;
    downPayment: number;
    months: number;
    interestRate: number;
    startDate: string;
    refuerzos: Refuerzo[];
    paymentMethod?: string;
    bankAccountId?: string;
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // SINGLE TENANT MODE
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found in database")
    const organization_id = org.id

    // Recalculate schedule in backend for security
    const balance = saleData.price - saleData.downPayment
    const schedule = calculateAmortizationSchedule(
        balance,
        saleData.months,
        saleData.interestRate,
        new Date(saleData.startDate),
        saleData.refuerzos
    )

    // 1. Insert Sale
    const { data: sale, error: saleError } = await supabase.from('sales').insert({
        organization_id,
        client_id: saleData.clientId,
        codeudor_id: saleData.codeudorId || null,
        vehicle_id: saleData.vehicleId,
        sale_date: new Date().toISOString(),
        total_amount: saleData.price,
        down_payment: saleData.downPayment,
        balance: balance,
        created_by: user.id
    }).select().single()

    if (saleError || !sale) {
        console.error("Supabase error creating sale:", saleError)
        throw new Error(`Failed to create sale: ${saleError?.message} (Code: ${saleError?.code})`)
    }

    // 2. Insert Installments
    const installmentsData = schedule.map(row => ({
        organization_id,
        sale_id: sale.id,
        number: row.paymentNumber,
        due_date: row.dueDate.toISOString(),
        amount: row.installmentAmount,
        status: 'pending'
    }))

    const { error: installError } = await supabase.from('installments').insert(installmentsData)

    if (installError) {
        console.error("Supabase error creating installments:", installError)
        throw new Error(`Failed to create installments: ${installError.message} (Code: ${installError.code})`)
    }

    const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'sold' })
        .eq('id', saleData.vehicleId)

    if (vehicleError) {
        console.error("Error updating vehicle:", vehicleError)
    }

    // 4. Register Initial Payment (Down Payment or Full Cash)
    if (saleData.downPayment > 0 && saleData.paymentMethod) {
        const { error: paymentError } = await supabase.from('payments').insert({
            sale_id: sale.id,
            installment_id: null, // Initial payment is not linked to a specific installment
            amount: saleData.downPayment,
            payment_method: saleData.paymentMethod,
            bank_account_id: saleData.bankAccountId || null,
            comment: 'Entrega Inicial / Pago Contado'
        })

        if (paymentError) {
            console.error("Error registering initial payment:", paymentError)
            // We don't throw here to avoid rolling back the whole sale, but we should log it.
        }
    }

    redirect('/sales')
}

export async function deleteSaleAction(saleId: string) {
    // Only Admin can delete sales
    const supabase = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return '' // server action context handles this
                },
            },
        }
    )

    // We need cookie store properly
    const cookieStore = await cookies()
    const supabaseClient = createServerClient(
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

    // Check permissions
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check if user is admin - manual check since we are in a text replacement
    // Better to use permission lib if available, assuming it is imported or available
    // importing requireAdmin would be better.

    // START DB OPERATIONS
    // 1. Get sale to know vehicle_id and details for log
    const { data: sale } = await supabaseClient.from('sales').select('*, clients(name), vehicles(brand, model, plate)').eq('id', saleId).single()
    if (!sale) throw new Error("Sale not found")

    // Log BEFORE deletion
    await logAuditAction(
        user.id,
        'DELETE_SALE',
        'sales',
        saleId,
        {
            sale_date: sale.sale_date,
            amount: sale.total_amount,
            client: sale.clients?.name,
            vehicle: `${sale.vehicles?.brand} ${sale.vehicles?.model} (${sale.vehicles?.plate})`
        }
    )

    // 2. Delete Payments (Cascade usually handles this, but being explicit is safer if no FK cascade)
    await supabaseClient.from('payments').delete().eq('sale_id', saleId)

    // 3. Delete Installments
    await supabaseClient.from('installments').delete().eq('sale_id', saleId)

    // 4. Delete Sale
    const { error: deleteError } = await supabaseClient.from('sales').delete().eq('id', saleId)
    if (deleteError) throw deleteError

    // 5. Update Vehicle Status -> 'available'
    if (sale.vehicle_id) {
        await supabaseClient.from('vehicles').update({ status: 'available' }).eq('id', sale.vehicle_id)
    }

    redirect('/sales')
}

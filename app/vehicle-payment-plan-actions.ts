'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
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
}


export interface Reinforcement {
    month: number
    amount: number
}

export interface PaymentPlanData {
    name: string
    months: number
    annual_interest_rate: number
    suggested_down_payment?: number
    suggested_down_payment_percentage?: number
    is_default?: boolean
    reinforcements?: Reinforcement[]
}

export async function createPaymentPlanAction(vehicleId: string, planData: PaymentPlanData) {
    const supabase = await getSupabase()

    // If this plan is marked as default, unset other defaults for this vehicle
    if (planData.is_default) {
        await supabase
            .from('vehicle_payment_plans')
            .update({ is_default: false })
            .eq('vehicle_id', vehicleId)
    }

    const { data, error } = await supabase
        .from('vehicle_payment_plans')
        .insert({
            vehicle_id: vehicleId,
            ...planData,
            reinforcements: planData.reinforcements || []
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating payment plan:', error)
        throw new Error(`Failed to create payment plan: ${error.message}`)
    }

    revalidatePath(`/inventory/${vehicleId}`)
    revalidatePath(`/inventory/${vehicleId}/edit`)
    return { success: true, data }
}

export async function updatePaymentPlanAction(planId: string, planData: Partial<PaymentPlanData>) {
    const supabase = await getSupabase()

    // If setting this as default, get vehicle_id first
    if (planData.is_default) {
        const { data: plan } = await supabase
            .from('vehicle_payment_plans')
            .select('vehicle_id')
            .eq('id', planId)
            .single()

        if (plan) {
            await supabase
                .from('vehicle_payment_plans')
                .update({ is_default: false })
                .eq('vehicle_id', plan.vehicle_id)
        }
    }

    const { data, error } = await supabase
        .from('vehicle_payment_plans')
        .update(planData)
        .eq('id', planId)
        .select()
        .single()

    if (error) {
        console.error('Error updating payment plan:', error)
        throw new Error(`Failed to update payment plan: ${error.message}`)
    }

    revalidatePath('/inventory')
    return { success: true, data }
}

export async function deletePaymentPlanAction(planId: string) {
    const supabase = await getSupabase()

    const { error } = await supabase
        .from('vehicle_payment_plans')
        .delete()
        .eq('id', planId)

    if (error) {
        console.error('Error deleting payment plan:', error)
        throw new Error(`Failed to delete payment plan: ${error.message}`)
    }

    revalidatePath('/inventory')
    return { success: true }
}

export async function getVehiclePaymentPlansAction(vehicleId: string) {
    const supabase = await getSupabase()

    const { data, error } = await supabase
        .from('vehicle_payment_plans')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('is_default', { ascending: false })
        .order('months', { ascending: true })

    if (error) {
        console.error('Error fetching payment plans:', error)
        return []
    }

    return data || []
}

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

// Generic helper to get organization
// Generic helper to get organization
async function getOrganizationId(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    // 1. Try to get from profile
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    if (profile?.organization_id) return profile.organization_id

    // 2. Fallback: Get first organization (mostly for dev/bootstrap)
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found")
    return org.id
}

// ... existing code ...

export async function getParametricData() {
    const supabase = await getSupabase()

    const [
        brands,
        models,
        categories,
        types,
        financialCosts,
        paymentMethods,
        taxes,
        creditors,
        orgSettings,
        bankAccounts
    ] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('models').select('*, brands(name)').order('name'),
        supabase.from('vehicle_categories').select('*').order('name'),
        supabase.from('vehicle_types').select('*').order('name'),
        supabase.from('cost_concepts').select('*').order('name'),
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('taxes').select('*').order('name'),
        supabase.from('creditors').select('*').order('name'),
        supabase.from('organization_settings').select('*').single(),
        supabase.from('bank_accounts').select('*').order('created_at')
    ])

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Debug info
    let debugInfo: any = {
        authError: authError?.message || null,
        userId: user?.id || null,
        orgId: null,
        profileFound: false
    }

    if (user) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
        debugInfo.orgId = profile?.organization_id
        debugInfo.profileError = profileError?.message
        debugInfo.profileFound = !!profile
    }

    // Explicitly using the org ID if found, to see if manual query works vs RLS auto
    // But for now, we leave the queries as is (relying on RLS) to test RLS.

    return {
        brands: brands.data || [],
        models: models.data || [],
        categories: categories.data || [],
        types: types.data || [],
        costConcepts: financialCosts.data || [],
        paymentMethods: paymentMethods.data || [],
        taxes: taxes.data || [],
        creditors: creditors.data || [],
        orgSettings: orgSettings.data || null,
        bankAccounts: bankAccounts.data || [],
        debug: debugInfo
    }
}

// --- GENERIC ACTIONS (Where structure is simple name/id) ---

export async function saveSimpleItem(table: string, name: string, id?: string) {
    const supabase = await getSupabase()
    const organization_id = await getOrganizationId(supabase)

    if (id) {
        await supabase.from(table).update({ name }).eq('id', id)
    } else {
        await supabase.from(table).insert({ name, organization_id })
    }
    revalidatePath('/settings')
}

export async function deleteItem(table: string, id: string) {
    const supabase = await getSupabase()
    await supabase.from(table).delete().eq('id', id)
    revalidatePath('/settings')
}

// --- SPECIFIC ACTIONS (For complex tables) ---

export async function saveModel(name: string, brandId?: string, id?: string) {
    const supabase = await getSupabase()
    const organization_id = await getOrganizationId(supabase)

    const data: any = { name, organization_id }
    if (brandId) data.brand_id = brandId

    if (id) {
        await supabase.from('models').update(data).eq('id', id)
    } else {
        await supabase.from('models').insert(data)
    }
    revalidatePath('/settings')
}

export async function saveTax(name: string, rate: number, id?: string) {
    const supabase = await getSupabase()
    const organization_id = await getOrganizationId(supabase)

    const data = { name, rate, organization_id }

    if (id) {
        await supabase.from('taxes').update(data).eq('id', id)
    } else {
        await supabase.from('taxes').insert(data)
    }
    revalidatePath('/settings')
}

export async function saveOrganizationSettings(defaultPenalty: number, penaltyDays: number, id?: string) {
    const supabase = await getSupabase()
    const organization_id = await getOrganizationId(supabase)

    const data = {
        organization_id,
        default_penalty_amount: defaultPenalty,
        penalty_grace_days: penaltyDays
    }

    if (id) {
        await supabase.from('organization_settings').update(data).eq('id', id)
    } else {
        await supabase.from('organization_settings').insert(data)
    }
    revalidatePath('/settings')
}

export async function saveBankAccount(data: any, id?: string) {
    const supabase = await getSupabase()
    const organization_id = await getOrganizationId(supabase)

    const payload = {
        ...data,
        organization_id
    }

    if (id) {
        await supabase.from('bank_accounts').update(payload).eq('id', id)
    } else {
        await supabase.from('bank_accounts').insert(payload)
    }
    revalidatePath('/settings')
}

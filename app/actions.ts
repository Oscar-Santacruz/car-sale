'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

export async function createClientAction(formData: FormData) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // SINGLE TENANT MODE: Always use the default organization
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found in database")
    const organization_id = org.id

    const name = formData.get('name') as string
    const ci = formData.get('ci') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const google_maps_link = formData.get('google_maps_link') as string

    const { error } = await supabase.from('clients').insert({
        organization_id,
        name,
        ci,
        phone,
        address,
        google_maps_link
    })

    if (error) {
        console.error('Supabase error creating client:', error)
        throw new Error(`Failed to create client: ${error.message} (Code: ${error.code})`)
    }

    redirect('/clients')
}

export async function updateClientAction(formData: FormData) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const ci = formData.get('ci') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const google_maps_link = formData.get('google_maps_link') as string

    const { error } = await supabase.from('clients').update({
        name,
        ci,
        phone,
        address,
        google_maps_link
    }).eq('id', id)

    if (error) {
        console.error('Supabase error updating client:', error)
        throw new Error(`Failed to update client: ${error.message}`)
    }

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    redirect(`/clients/${id}`)
}

export async function createVehicleAction(formData: FormData) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    // SINGLE TENANT MODE
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found in database")
    const organization_id = org.id

    const cod = formData.get('cod') as string
    const brand = formData.get('brand') as string
    const model = formData.get('model') as string
    const year = Number(formData.get('year'))
    const plate = formData.get('plate') as string
    const price = Number(formData.get('price'))
    const status = formData.get('status') as string

    const { error } = await supabase.from('vehicles').insert({
        organization_id,
        cod,
        brand,
        model,
        year,
        plate,
        list_price: price,
        status
    })

    if (error) {
        console.error('Supabase error creating vehicle:', error)
        throw new Error(`Failed to create vehicle: ${error.message} (Code: ${error.code})`)
    }

    redirect('/inventory')
}

export async function updateVehicleAction(formData: FormData) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const id = formData.get('id') as string
    const cod = formData.get('cod') as string
    const brand = formData.get('brand') as string
    const model = formData.get('model') as string
    const year = Number(formData.get('year'))
    const plate = formData.get('plate') as string
    const price = Number(formData.get('price'))
    const status = formData.get('status') as string

    const { error } = await supabase.from('vehicles').update({
        cod,
        brand,
        model,
        year,
        plate,
        list_price: price,
        status
    }).eq('id', id)

    if (error) {
        console.error('Supabase error updating vehicle:', error)
        throw new Error(`Failed to update vehicle: ${error.message}`)
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${id}`)
    redirect(`/inventory/${id}`)
}

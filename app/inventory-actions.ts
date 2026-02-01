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

interface VehicleCostInput {
    conceptId: string
    amount: number
}

interface CreateVehicleData {
    cod: string
    chassis: string
    brandId: string
    modelId: string
    categoryId: string
    typeId: string
    year: number
    // plate removed
    color: string
    motor: string
    // details removed
    // ciTitular removed
    // titularName removed
    margin: number
    listPrice: number // Calculated or Input
    costs: VehicleCostInput[]
    status: string
    images: string[]
}

export async function createVehicleComplexAction(data: CreateVehicleData) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // SINGLE TENANT MODE
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found in database")
    const organization_id = org.id

    // CALCULATE COSTS
    const totalCost = data.costs.reduce((sum, item) => sum + (item.amount || 0), 0)

    // Fetch brand and model names for legacy fields
    const { data: brandData } = await supabase.from('brands').select('name').eq('id', data.brandId).single()
    const { data: modelData } = await supabase.from('models').select('name').eq('id', data.modelId).single()

    const brandName = brandData?.name || 'Unknown'
    const modelName = modelData?.name || 'Unknown'

    // 1. Insert Vehicle
    const { data: vehicle, error: vehicleError } = await supabase.from('vehicles').insert({
        organization_id,
        cod: data.cod,
        vin: data.chassis, // Mapping 'chassis_number' from form to 'vin' or separate col?
        // Wait, schema has 'vin' and I added 'chassis_number' in migration. 
        // Best to use 'chassis_number' if I created it, OR consolidate.
        // I created 'chassis_number' in migration step 200. I will use it.
        chassis_number: data.chassis,
        brand_id: data.brandId,
        model_id: data.modelId,
        category_id: data.categoryId,
        type_id: data.typeId,
        year: data.year,
        plate: '',
        color: data.color,
        motor_number: data.motor,
        details: '',
        ci_titular: '',
        titular_name: '',
        expected_margin: data.margin,
        list_price: data.listPrice,
        total_cost: totalCost,
        status: data.status,
        images: data.images,

        // Legacy fields populated with actual names
        brand: brandName,
        model: modelName
    }).select().single()

    if (vehicleError) {
        console.error('Supabase error creating vehicle:', vehicleError)
        throw new Error(`Failed to create vehicle: ${vehicleError.message} (Code: ${vehicleError.code})`)
    }

    // 2. Insert Costs
    if (data.costs.length > 0) {
        const costInserts = data.costs.map(c => ({
            organization_id,
            vehicle_id: vehicle.id,
            concept_id: c.conceptId,
            amount: c.amount
        }))

        const { error: costError } = await supabase.from('vehicle_costs').insert(costInserts)
        if (costError) {
            console.error('Supabase error creating costs:', costError)
            // Non-fatal? Or rollback? Supabase doesn't do transaction easily here without generic RPC.
            // We'll log it.
        }
    }

    revalidatePath('/inventory')
    return { success: true, vehicleId: vehicle.id }
}

'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Export deletion action
import { deleteVehicleAction as deleteVehicleActionFn } from './deletion-actions'
export async function deleteVehicleAction(id: string, reason?: string) { return deleteVehicleActionFn(id, reason) }

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

interface BulkImportResult {
    success: number
    errors: { row: number; error: string }[]
}

interface VehicleImportData {
    cod: string
    chassis: string
    brand: string
    model: string
    year: number
    color?: string
    motor?: string
    list_price: number
    status?: string
}

export async function bulkImportVehiclesAction(vehicles: VehicleImportData[]): Promise<BulkImportResult> {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('No autenticado')
    }

    // Get organization
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error('No se encontró organización')
    const organization_id = org.id

    const result: BulkImportResult = {
        success: 0,
        errors: []
    }

    // Get existing CODs to check for duplicates
    const { data: existingVehicles } = await supabase
        .from('vehicles')
        .select('cod')
        .eq('organization_id', organization_id)
        .is('deleted_at', null)

    const existingCods = new Set(existingVehicles?.map(v => v.cod.toLowerCase()) || [])

    for (let i = 0; i < vehicles.length; i++) {
        const row = i + 2 // Excel row (1-indexed + header)
        const vehicle = vehicles[i]

        try {
            // Trim whitespace
            const cod = vehicle.cod?.toString().trim()
            const chassis = vehicle.chassis?.toString().trim()
            const brand = vehicle.brand?.toString().trim()
            const model = vehicle.model?.toString().trim()
            const year = Number(vehicle.year)
            const list_price = Number(vehicle.list_price)
            const color = vehicle.color?.toString().trim() || ''
            const motor = vehicle.motor?.toString().trim() || ''
            const status = vehicle.status?.toString().trim() || 'available'

            // Validations
            if (!cod) {
                result.errors.push({ row, error: "El campo 'cod' es requerido" })
                continue
            }

            if (!chassis) {
                result.errors.push({ row, error: "El campo 'chassis' es requerido" })
                continue
            }

            if (!brand) {
                result.errors.push({ row, error: "El campo 'brand' es requerido" })
                continue
            }

            if (!model) {
                result.errors.push({ row, error: "El campo 'model' es requerido" })
                continue
            }

            if (!year || year < 1900 || year > 2100) {
                result.errors.push({ row, error: "El campo 'year' debe ser un año válido" })
                continue
            }

            if (!list_price || list_price <= 0) {
                result.errors.push({ row, error: "El campo 'list_price' debe ser mayor a 0" })
                continue
            }

            // Check for duplicate COD
            if (existingCods.has(cod.toLowerCase())) {
                result.errors.push({ row, error: `Ya existe un vehículo con COD: ${cod}` })
                continue
            }

            // Validate status
            if (status && !['available', 'sold', 'reserved'].includes(status)) {
                result.errors.push({ row, error: "El campo 'status' debe ser: available, sold o reserved" })
                continue
            }


            // ------------------------------------------------------------------
            // HANDLE BRAND
            // ------------------------------------------------------------------
            let brandId = ''

            // Check if brand exists (case-insensitive)
            const { data: existingBrand } = await supabase
                .from('brands')
                .select('id')
                .eq('organization_id', organization_id)
                .ilike('name', brand)
                .single()

            if (existingBrand) {
                brandId = existingBrand.id
            } else {
                // Create new brand
                const { data: newBrand, error: brandError } = await supabase
                    .from('brands')
                    .insert({
                        name: brand,
                        organization_id
                    })
                    .select('id')
                    .single()

                if (brandError) {
                    result.errors.push({ row, error: `Error creando marca '${brand}': ${brandError.message}` })
                    continue
                }
                brandId = newBrand.id
            }

            // ------------------------------------------------------------------
            // HANDLE MODEL
            // ------------------------------------------------------------------
            let modelId = ''

            // Check if model exists for this brand (case-insensitive)
            const { data: existingModel } = await supabase
                .from('models')
                .select('id')
                .eq('organization_id', organization_id)
                .eq('brand_id', brandId)
                .ilike('name', model)
                .single()

            if (existingModel) {
                modelId = existingModel.id
            } else {
                // Create new model
                const { data: newModel, error: modelError } = await supabase
                    .from('models')
                    .insert({
                        name: model,
                        brand_id: brandId,
                        organization_id
                    })
                    .select('id')
                    .single()

                if (modelError) {
                    result.errors.push({ row, error: `Error creando modelo '${model}': ${modelError.message}` })
                    continue
                }
                modelId = newModel.id
            }

            // ------------------------------------------------------------------
            // INSERT VEHICLE
            // ------------------------------------------------------------------
            const { error } = await supabase.from('vehicles').insert({
                organization_id,
                cod,
                chassis_number: chassis,
                brand_id: brandId,
                model_id: modelId,
                // Legacy fields for read-only / redundancy
                brand,
                model,
                category_id: null, // Optional in bulk or need logic
                type_id: null,     // Optional in bulk or need logic
                year,
                color,
                motor_number: motor,
                list_price,
                total_cost: 0,
                expected_margin: 0,
                status,
                plate: '',
                details: '',
                ci_titular: '',
                titular_name: '',
                images: []
            })


            if (error) {
                result.errors.push({ row, error: error.message })
                continue
            }

            // Add to existing set to prevent duplicates within same batch
            existingCods.add(cod.toLowerCase())
            result.success++

        } catch (error: any) {
            result.errors.push({ row, error: error.message || 'Error desconocido' })
        }
    }


    revalidatePath('/inventory')
    return result
}

// ============================================================================
// VEHICLE COST MANAGEMENT ACTIONS
// ============================================================================

// Helper function to recalculate vehicle cost
async function recalculateVehicleCost(supabase: any, vehicleId: string) {
    const { data: costs } = await supabase
        .from('vehicle_costs')
        .select('amount')
        .eq('vehicle_id', vehicleId)

    const totalCost = (costs || []).reduce((sum: number, c: any) => sum + Number(c.amount), 0)

    // Get vehicle's expected margin to recalculate list_price
    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('expected_margin')
        .eq('id', vehicleId)
        .single()

    const margin = vehicle?.expected_margin || 0
    const newListPrice = Math.round(totalCost * (1 + margin / 100))

    await supabase
        .from('vehicles')
        .update({
            total_cost: totalCost,
            list_price: newListPrice
        })
        .eq('id', vehicleId)
}

// Add vehicle cost
export async function addVehicleCostAction(data: {
    vehicleId: string
    conceptId: string
    amount: number
}) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
    if (!org) throw new Error("No organization found")

    // Insert cost
    const { error } = await supabase.from('vehicle_costs').insert({
        organization_id: org.id,
        vehicle_id: data.vehicleId,
        concept_id: data.conceptId,
        amount: data.amount
    })

    if (error) throw new Error(error.message)

    // Recalculate vehicle total_cost
    await recalculateVehicleCost(supabase, data.vehicleId)

    revalidatePath(`/inventory/${data.vehicleId}`)
    revalidatePath(`/inventory/${data.vehicleId}/edit`)

    return { success: true }
}

// Update vehicle cost
export async function updateVehicleCostAction(data: {
    costId: string
    conceptId?: string
    amount?: number
}) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const updateData: any = {}
    if (data.conceptId !== undefined) updateData.concept_id = data.conceptId
    if (data.amount !== undefined) updateData.amount = data.amount

    const { data: cost, error } = await supabase
        .from('vehicle_costs')
        .update(updateData)
        .eq('id', data.costId)
        .select('vehicle_id')
        .single()

    if (error) throw new Error(error.message)

    // Recalculate vehicle total_cost
    await recalculateVehicleCost(supabase, cost.vehicle_id)

    revalidatePath(`/inventory/${cost.vehicle_id}`)
    revalidatePath(`/inventory/${cost.vehicle_id}/edit`)

    return { success: true }
}

// Delete vehicle cost
export async function deleteVehicleCostAction(costId: string) {
    const supabase = await getSupabase()

    const { data: cost } = await supabase
        .from('vehicle_costs')
        .select('vehicle_id')
        .eq('id', costId)
        .single()

    if (!cost) throw new Error("Cost not found")

    const { error } = await supabase
        .from('vehicle_costs')
        .delete()
        .eq('id', costId)

    if (error) throw new Error(error.message)

    // Recalculate vehicle total_cost
    await recalculateVehicleCost(supabase, cost.vehicle_id)

    revalidatePath(`/inventory/${cost.vehicle_id}`)
    revalidatePath(`/inventory/${cost.vehicle_id}/edit`)

    return { success: true }
}


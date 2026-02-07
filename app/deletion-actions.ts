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

async function getAuthContext() {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        throw new Error('No organization found')
    }

    return {
        supabase,
        userId: user.id,
        organizationId: profile.organization_id
    }
}

interface DeletionResult {
    success: boolean
    message: string
    error?: string
    details?: any
}

/**
 * Generic function to audit deletion
 */
async function auditDeletion(
    supabase: any,
    organizationId: string,
    userId: string,
    tableName: string,
    recordId: string,
    recordData: any,
    reason?: string
) {
    const { error } = await supabase
        .from('deletion_audit')
        .insert({
            organization_id: organizationId,
            table_name: tableName,
            record_id: recordId,
            record_data: recordData,
            deleted_by: userId,
            reason: reason || null
        })

    if (error) {
        console.error('Error auditing deletion:', error)
    }
}

/**
 * Delete a client with validation and audit
 */
export async function deleteClientAction(clientId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get client data before deletion
        const { data: client, error: fetchError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single()

        if (fetchError || !client) {
            return {
                success: false,
                message: 'Cliente no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_client', { client_uuid: clientId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el cliente',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'clients', clientId, client, reason)

        // Delete the client
        const { error: deleteError } = await supabase
            .from('clients')
            .delete()
            .eq('id', clientId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el cliente',
                error: deleteError.message
            }
        }

        revalidatePath('/clients')
        return {
            success: true,
            message: 'Cliente eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el cliente',
            error: error.message
        }
    }
}

/**
 * Delete a vehicle with validation and audit
 */
export async function deleteVehicleAction(vehicleId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get vehicle data before deletion
        const { data: vehicle, error: fetchError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', vehicleId)
            .single()

        if (fetchError || !vehicle) {
            return {
                success: false,
                message: 'Vehículo no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_vehicle', { vehicle_uuid: vehicleId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el vehículo',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'vehicles', vehicleId, vehicle, reason)

        // Delete the vehicle (this will cascade to vehicle_costs)
        const { error: deleteError } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', vehicleId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el vehículo',
                error: deleteError.message
            }
        }

        revalidatePath('/inventory')
        return {
            success: true,
            message: 'Vehículo eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el vehículo',
            error: error.message
        }
    }
}

/**
 * Delete a sale with validation and audit
 */
export async function deleteSaleAction(saleId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get sale data before deletion
        const { data: sale, error: fetchError } = await supabase
            .from('sales')
            .select('*')
            .eq('id', saleId)
            .single()

        if (fetchError || !sale) {
            return {
                success: false,
                message: 'Venta no encontrada',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_sale', { sale_uuid: saleId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar la venta',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'sales', saleId, sale, reason)

        // Delete the sale (this will cascade to installments)
        const { error: deleteError } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar la venta',
                error: deleteError.message
            }
        }

        revalidatePath('/sales')
        return {
            success: true,
            message: 'Venta eliminada exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar la venta',
            error: error.message
        }
    }
}

/**
 * Delete a payment with audit
 */
export async function deletePaymentAction(paymentId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get payment data before deletion
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single()

        if (fetchError || !payment) {
            return {
                success: false,
                message: 'Pago no encontrado',
                error: fetchError?.message
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'payments', paymentId, payment, reason)

        // Delete the payment
        const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el pago',
                error: deleteError.message
            }
        }

        revalidatePath('/collections')
        return {
            success: true,
            message: 'Pago eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el pago',
            error: error.message
        }
    }
}

/**
 * Delete a brand with validation and audit
 */
export async function deleteBrandAction(brandId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get brand data before deletion
        const { data: brand, error: fetchError } = await supabase
            .from('brands')
            .select('*')
            .eq('id', brandId)
            .single()

        if (fetchError || !brand) {
            return {
                success: false,
                message: 'Marca no encontrada',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_brand', { brand_uuid: brandId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar la marca',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'brands', brandId, brand, reason)

        // Delete the brand
        const { error: deleteError } = await supabase
            .from('brands')
            .delete()
            .eq('id', brandId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar la marca',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Marca eliminada exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar la marca',
            error: error.message
        }
    }
}

/**
 * Delete a model with validation and audit
 */
export async function deleteModelAction(modelId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get model data before deletion
        const { data: model, error: fetchError } = await supabase
            .from('models')
            .select('*')
            .eq('id', modelId)
            .single()

        if (fetchError || !model) {
            return {
                success: false,
                message: 'Modelo no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_model', { model_uuid: modelId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el modelo',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'models', modelId, model, reason)

        // Delete the model
        const { error: deleteError } = await supabase
            .from('models')
            .delete()
            .eq('id', modelId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el modelo',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Modelo eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el modelo',
            error: error.message
        }
    }
}

/**
 * Delete a cost concept with validation and audit
 */
export async function deleteCostConceptAction(conceptId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get concept data before deletion
        const { data: concept, error: fetchError } = await supabase
            .from('cost_concepts')
            .select('*')
            .eq('id', conceptId)
            .single()

        if (fetchError || !concept) {
            return {
                success: false,
                message: 'Concepto de costo no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_cost_concept', { concept_uuid: conceptId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el concepto de costo',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'cost_concepts', conceptId, concept, reason)

        // Delete the concept
        const { error: deleteError } = await supabase
            .from('cost_concepts')
            .delete()
            .eq('id', conceptId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el concepto de costo',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Concepto de costo eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el concepto de costo',
            error: error.message
        }
    }
}

/**
 * Delete a vehicle category with validation and audit
 */
export async function deleteVehicleCategoryAction(categoryId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get category data before deletion
        const { data: category, error: fetchError } = await supabase
            .from('vehicle_categories')
            .select('*')
            .eq('id', categoryId)
            .single()

        if (fetchError || !category) {
            return {
                success: false,
                message: 'Categoría no encontrada',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_vehicle_category', { category_uuid: categoryId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar la categoría',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'vehicle_categories', categoryId, category, reason)

        // Delete the category
        const { error: deleteError } = await supabase
            .from('vehicle_categories')
            .delete()
            .eq('id', categoryId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar la categoría',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Categoría eliminada exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar la categoría',
            error: error.message
        }
    }
}

/**
 * Delete a vehicle type with validation and audit
 */
export async function deleteVehicleTypeAction(typeId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get type data before deletion
        const { data: type, error: fetchError } = await supabase
            .from('vehicle_types')
            .select('*')
            .eq('id', typeId)
            .single()

        if (fetchError || !type) {
            return {
                success: false,
                message: 'Tipo no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_vehicle_type', { type_uuid: typeId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el tipo',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'vehicle_types', typeId, type, reason)

        // Delete the type
        const { error: deleteError } = await supabase
            .from('vehicle_types')
            .delete()
            .eq('id', typeId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el tipo',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Tipo eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el tipo',
            error: error.message
        }
    }
}

/**
 * Delete a payment method with validation and audit
 */
export async function deletePaymentMethodAction(methodId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get method data before deletion
        const { data: method, error: fetchError } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('id', methodId)
            .single()

        if (fetchError || !method) {
            return {
                success: false,
                message: 'Método de pago no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_payment_method', { method_uuid: methodId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el método de pago',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit the deletion
        await auditDeletion(supabase, organizationId, userId, 'payment_methods', methodId, method, reason)

        // Delete the method
        const { error: deleteError } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', methodId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el método de pago',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Método de pago eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el método de pago',
            error: error.message
        }
    }
}

/**
 * Delete a tax with validation and audit
 */
export async function deleteTaxAction(taxId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get tax data before deletion
        const { data: tax, error: fetchError } = await supabase
            .from('taxes')
            .select('*')
            .eq('id', taxId)
            .single()

        if (fetchError || !tax) {
            return {
                success: false,
                message: 'Impuesto no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_tax', { tax_uuid: taxId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el impuesto',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit its deletion
        await auditDeletion(supabase, organizationId, userId, 'taxes', taxId, tax, reason)

        // Delete the tax
        const { error: deleteError } = await supabase
            .from('taxes')
            .delete()
            .eq('id', taxId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el impuesto',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Impuesto eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el impuesto',
            error: error.message
        }
    }
}

/**
 * Delete a bank account with validation and audit
 */
export async function deleteBankAccountAction(accountId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get account data before deletion
        const { data: account, error: fetchError } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('id', accountId)
            .single()

        if (fetchError || !account) {
            return {
                success: false,
                message: 'Cuenta bancaria no encontrada',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_bank_account', { account_uuid: accountId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar la cuenta bancaria',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit its deletion
        await auditDeletion(supabase, organizationId, userId, 'bank_accounts', accountId, account, reason)

        // Delete the account
        const { error: deleteError } = await supabase
            .from('bank_accounts')
            .delete()
            .eq('id', accountId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar la cuenta bancaria',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Cuenta bancaria eliminada exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar la cuenta bancaria',
            error: error.message
        }
    }
}

/**
 * Delete a creditor with validation and audit
 */
export async function deleteCreditorAction(creditorId: string, reason?: string): Promise<DeletionResult> {
    try {
        const { supabase, userId, organizationId } = await getAuthContext()

        // Get creditor data before deletion
        const { data: creditor, error: fetchError } = await supabase
            .from('creditors')
            .select('*')
            .eq('id', creditorId)
            .single()

        if (fetchError || !creditor) {
            return {
                success: false,
                message: 'Acreedor no encontrado',
                error: fetchError?.message
            }
        }

        // Validate deletion
        const { data: validation } = await supabase
            .rpc('can_delete_creditor', { creditor_uuid: creditorId })

        if (!validation?.can_delete) {
            return {
                success: false,
                message: validation?.message || 'No se puede eliminar el acreedor',
                error: validation?.reason,
                details: validation
            }
        }

        // Audit its deletion
        await auditDeletion(supabase, organizationId, userId, 'creditors', creditorId, creditor, reason)

        // Delete the creditor
        const { error: deleteError } = await supabase
            .from('creditors')
            .delete()
            .eq('id', creditorId)

        if (deleteError) {
            return {
                success: false,
                message: 'Error al eliminar el acreedor',
                error: deleteError.message
            }
        }

        revalidatePath('/settings')
        return {
            success: true,
            message: 'Acreedor eliminado exitosamente'
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error inesperado al eliminar el acreedor',
            error: error.message
        }
    }
}

/**
 * Get deletion audit log
 */
export async function getDeletionAuditLog(
    tableName?: string,
    limit: number = 50
) {
    try {
        const { supabase, organizationId } = await getAuthContext()

        let query = supabase
            .from('deletion_audit')
            .select(`
                *,
                deleted_by_profile:profiles!deletion_audit_deleted_by_fkey(email)
            `)
            .eq('organization_id', organizationId)
            .order('deleted_at', { ascending: false })
            .limit(limit)

        if (tableName) {
            query = query.eq('table_name', tableName)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return {
            success: true,
            data: data || []
        }

    } catch (error: any) {
        return {
            success: false,
            message: 'Error al obtener el registro de auditoría',
            error: error.message,
            data: []
        }
    }
}

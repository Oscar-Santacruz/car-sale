-- Migration: Deletion Audit System
-- Created: 2026-02-07
-- Description: Creates audit table for tracking deletions and validation functions

-- =====================================================
-- 1. AUDIT TABLE FOR DELETIONS
-- =====================================================

create table if not exists deletion_audit (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations on delete cascade not null,
    
    -- What was deleted
    table_name text not null,
    record_id uuid not null,
    record_data jsonb, -- Store the full record before deletion
    
    -- Who deleted it
    deleted_by uuid references auth.users(id) on delete set null,
    deleted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Additional context
    reason text, -- Optional reason for deletion
    ip_address text
);

-- Index for performance
create index if not exists idx_deletion_audit_org on deletion_audit(organization_id);
create index if not exists idx_deletion_audit_table on deletion_audit(table_name);
create index if not exists idx_deletion_audit_deleted_at on deletion_audit(deleted_at);

-- Enable RLS
alter table deletion_audit enable row level security;

-- RLS Policies
create policy "Org Members can view audit" on deletion_audit
    for select using (organization_id = get_auth_org_id());

create policy "Org Members can insert audit" on deletion_audit
    for insert with check (organization_id = get_auth_org_id());


-- =====================================================
-- 2. VALIDATION FUNCTIONS
-- =====================================================

-- Function to check if a client can be deleted
create or replace function can_delete_client(client_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    sales_count integer;
    blocking_sales jsonb;
begin
    -- Check for related sales
    select count(*), jsonb_agg(jsonb_build_object('id', id, 'sale_date', sale_date))
    into sales_count, blocking_sales
    from sales
    where client_id = client_uuid
    limit 5; -- Limit to first 5 for error message
    
    if sales_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'client_has_sales',
            'message', format('No se puede eliminar el cliente porque tiene %s venta(s) relacionada(s). Debe eliminar primero las ventas asociadas.', sales_count),
            'blocking_records', blocking_sales,
            'count', sales_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a vehicle can be deleted
create or replace function can_delete_vehicle(vehicle_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    sales_count integer;
    blocking_sales jsonb;
begin
    -- Check for related sales
    select count(*), jsonb_agg(jsonb_build_object('id', id, 'sale_date', sale_date))
    into sales_count, blocking_sales
    from sales
    where vehicle_id = vehicle_uuid
    limit 5;
    
    if sales_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'vehicle_has_sales',
            'message', format('No se puede eliminar el vehículo porque tiene %s venta(s) relacionada(s). Debe eliminar primero las ventas asociadas.', sales_count),
            'blocking_records', blocking_sales,
            'count', sales_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a sale can be deleted
create or replace function can_delete_sale(sale_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    payments_count integer;
    installments_count integer;
    blocking_data jsonb;
begin
    -- Check for related payments
    select count(*) into payments_count
    from payments
    where sale_id = sale_uuid;
    
    -- Check for installments
    select count(*) into installments_count
    from installments
    where sale_id = sale_uuid;
    
    if payments_count > 0 or installments_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'sale_has_payments_or_installments',
            'message', format('No se puede eliminar la venta porque tiene %s pago(s) y %s cuota(s) relacionada(s). Las cuotas se eliminarán automáticamente, pero debe eliminar primero los pagos.', 
                payments_count, installments_count),
            'payments_count', payments_count,
            'installments_count', installments_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a brand can be deleted
create or replace function can_delete_brand(brand_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    models_count integer;
    vehicles_count integer;
    brand_name text;
    blocking_models jsonb;
begin
    -- Get brand name
    select name into brand_name from brands where id = brand_uuid;
    
    -- Check for related models
    select count(*), jsonb_agg(jsonb_build_object('id', id, 'name', name))
    into models_count, blocking_models
    from models
    where brand_id = brand_uuid
    limit 10;
    
    if models_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'brand_has_models',
            'message', format('No se puede eliminar la marca "%s" porque tiene %s modelo(s) relacionado(s). Debe eliminar primero todos los modelos de esta marca.', 
                brand_name, models_count),
            'blocking_records', blocking_models,
            'count', models_count
        );
    end if;
    
    -- Check for vehicles using this brand (direct reference)
    select count(*) into vehicles_count
    from vehicles
    where brand = brand_name;
    
    if vehicles_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'brand_has_vehicles',
            'message', format('No se puede eliminar la marca "%s" porque tiene %s vehículo(s) que la utilizan. Debe modificar o eliminar primero esos vehículos.', 
                brand_name, vehicles_count),
            'count', vehicles_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a model can be deleted
create or replace function can_delete_model(model_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    vehicles_count integer;
    model_name text;
begin
    -- Get model name
    select name into model_name from models where id = model_uuid;
    
    -- Check for vehicles using this model
    select count(*) into vehicles_count
    from vehicles
    where model = model_name;
    
    if vehicles_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'model_has_vehicles',
            'message', format('No se puede eliminar el modelo "%s" porque tiene %s vehículo(s) que lo utilizan. Debe modificar o eliminar primero esos vehículos.', 
                model_name, vehicles_count),
            'count', vehicles_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a cost concept can be deleted
create or replace function can_delete_cost_concept(concept_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    usage_count integer;
    concept_name text;
    blocking_records jsonb;
begin
    -- Get concept name
    select name into concept_name from cost_concepts where id = concept_uuid;
    
    -- Check for vehicle_costs using this concept
    select count(*), jsonb_agg(jsonb_build_object('vehicle_id', vehicle_id, 'amount', amount))
    into usage_count, blocking_records
    from vehicle_costs
    where concept_id = concept_uuid
    limit 10;
    
    if usage_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'concept_in_use',
            'message', format('No se puede eliminar el concepto de costo "%s" porque está siendo utilizado en %s registro(s) de costos de vehículos. Debe eliminar primero esos registros o cambiar el concepto.', 
                concept_name, usage_count),
            'blocking_records', blocking_records,
            'count', usage_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a vehicle category can be deleted
create or replace function can_delete_vehicle_category(category_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    vehicles_count integer;
    category_name text;
begin
    -- Get category name
    select name into category_name from vehicle_categories where id = category_uuid;
    
    -- Check for vehicles using this category
    select count(*) into vehicles_count
    from vehicles
    where details->>'category' = category_name;
    
    if vehicles_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'category_in_use',
            'message', format('No se puede eliminar la categoría "%s" porque tiene %s vehículo(s) que la utilizan. Debe modificar o eliminar primero esos vehículos.', 
                category_name, vehicles_count),
            'count', vehicles_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a vehicle type can be deleted
create or replace function can_delete_vehicle_type(type_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    vehicles_count integer;
    type_name text;
begin
    -- Get type name
    select name into type_name from vehicle_types where id = type_uuid;
    
    -- Check for vehicles using this type
    select count(*) into vehicles_count
    from vehicles
    where details->>'type' = type_name;
    
    if vehicles_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'type_in_use',
            'message', format('No se puede eliminar el tipo "%s" porque tiene %s vehículo(s) que lo utilizan. Debe modificar o eliminar primero esos vehículos.', 
                type_name, vehicles_count),
            'count', vehicles_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a payment method can be deleted
create or replace function can_delete_payment_method(method_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    payments_count integer;
    method_name text;
begin
    -- Get method name
    select name into method_name from payment_methods where id = method_uuid;
    
    -- Check for payments using this method
    select count(*) into payments_count
    from payments
    where payment_method = method_name;
    
    if payments_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'payment_method_in_use',
            'message', format('No se puede eliminar el método de pago "%s" porque tiene %s pago(s) que lo utilizan. No puede eliminar un método de pago que ya fue utilizado en transacciones.', 
                method_name, payments_count),
            'count', payments_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;


-- Function to check if a tax can be deleted
create or replace function can_delete_tax(tax_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    usage_count integer;
    tax_name text;
begin
    -- Get tax name
    select name into tax_name from taxes where id = tax_uuid;
    
    -- Check if used in any table (if applicable, e.g. products or sales with taxes)
    -- For now, we'll just check if it exists
    -- This is a placeholder as there might not be current references in schema.sql
    -- but we can add checks here if we find references.
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a bank account can be deleted
create or replace function can_delete_bank_account(account_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    payments_count integer;
    account_number text;
begin
    -- Get account identifier
    select account_number into account_number from bank_accounts where id = account_uuid;
    
    -- Check for payments using this account
    select count(*) into payments_count
    from payments
    where bank_account_id = account_uuid;
    
    if payments_count > 0 then
        return jsonb_build_object(
            'can_delete', false,
            'reason', 'bank_account_in_use',
            'message', format('No se puede eliminar la cuenta bancaria "%s" porque tiene %s pago(s) asociados. No puede eliminar una cuenta que tiene transacciones registradas.', 
                account_number, payments_count),
            'count', payments_count
        );
    end if;
    
    return jsonb_build_object('can_delete', true);
end;
$$;

-- Function to check if a creditor can be deleted
create or replace function can_delete_creditor(creditor_uuid uuid)
returns jsonb
language plpgsql
as $$
declare
    -- If there's a table linking creditors to something, check it here
    usage_count integer;
    creditor_name text;
begin
    select name into creditor_name from creditors where id = creditor_uuid;
    
    -- Placeholder for creditor usage check
    return jsonb_build_object('can_delete', true);
end;
$$;

-- =====================================================
-- 3. ADD DELETE POLICIES TO EXISTING TABLES
-- =====================================================

-- Clients
create policy "Org Members can delete clients" on clients
    for delete using (organization_id = get_auth_org_id());

-- Vehicles
create policy "Org Members can delete vehicles" on vehicles
    for delete using (organization_id = get_auth_org_id());

-- Sales
create policy "Org Members can delete sales" on sales
    for delete using (organization_id = get_auth_org_id());

-- Payments 
create policy "Org Members can delete payments" on payments
    for delete using (sale_id in (select id from sales where organization_id = get_auth_org_id()));

-- Installments (already has cascade delete from sales, but adding policy for completeness)
create policy "Org Members can delete installments" on installments
    for delete using (organization_id = get_auth_org_id());

-- Settings tables
create policy "Org Members can delete brands" on brands
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete models" on models
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete vehicle_categories" on vehicle_categories
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete vehicle_types" on vehicle_types
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete cost_concepts" on cost_concepts
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete payment_methods" on payment_methods
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete taxes" on taxes
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete bank_accounts" on bank_accounts
    for delete using (organization_id = get_auth_org_id());

create policy "Org Members can delete creditors" on creditors
    for delete using (organization_id = get_auth_org_id());

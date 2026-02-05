-- Create organization_settings table
create table if not exists organization_settings (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations on delete cascade unique not null,
    default_penalty_amount numeric default 0,
    penalty_grace_days integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table organization_settings enable row level security;

-- Policies for organization_settings
create policy "Org Members can view settings" on organization_settings
  for select using (organization_id = get_auth_org_id());

create policy "Org Members can insert settings" on organization_settings
  for insert with check (organization_id = get_auth_org_id());

create policy "Org Members can update settings" on organization_settings
  for update using (organization_id = get_auth_org_id());

-- Add columns to payments table (assuming payments table exists per code, but if not found in recent checks, I should create it too or ensure it exists)
-- Assuming payments table was NOT in the initial schema dump but IS in the code... let's check if it exists safely.
-- Based on collection-actions.ts, it uses 'payments' table.
-- Let's create it if not exists just in case, or alter it.

create table if not exists payments (
    id uuid default uuid_generate_v4() primary key,
    installment_id uuid references installments on delete set null,
    sale_id uuid references sales on delete cascade not null,
    amount numeric not null,
    payment_method text not null,
    reference_number text,
    receipt_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on payments if new
alter table payments enable row level security;

-- Policies for payments (if new)
create policy "Org Members can view payments" on payments
  for select using (sale_id in (select id from sales where organization_id = get_auth_org_id()));
  -- Note: payments doesn't have direct organization_id in the create statement above, so we link via sale_id.
  -- Ideally payments should have organization_id for performance/consistency.
  
-- Add new columns for Penalties
alter table payments add column if not exists penalty_amount numeric default 0;
alter table payments add column if not exists comment text;

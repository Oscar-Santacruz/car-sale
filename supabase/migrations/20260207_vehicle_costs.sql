-- Migration: Vehicle Costs Tables
-- Created: 2026-02-07
-- Description: Creates cost_concepts and vehicle_costs tables if they don't exist, and adds expected_margin to vehicles

-- Add expected_margin column to vehicles table if it doesn't exist
alter table vehicles add column if not exists expected_margin numeric default 20;

-- Cost Concepts table (parametric data)
create table if not exists cost_concepts (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations on delete cascade not null,
    name text not null,
    category text, -- 'purchase', 'modification', 'expense'
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vehicle Costs table
create table if not exists vehicle_costs (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations on delete cascade not null,
    vehicle_id uuid references vehicles on delete cascade not null,
    concept_id uuid references cost_concepts on delete restrict not null,
    amount numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table cost_concepts enable row level security;
alter table vehicle_costs enable row level security;

-- RLS Policies for cost_concepts
create policy if not exists "Org Members can view concepts" on cost_concepts
    for select using (organization_id = get_auth_org_id());

create policy if not exists "Org Members can insert concepts" on cost_concepts
    for insert with check (organization_id = get_auth_org_id());

create policy if not exists "Org Members can update concepts" on cost_concepts
    for update using (organization_id = get_auth_org_id());

create policy if not exists "Org Members can delete concepts" on cost_concepts
    for delete using (organization_id = get_auth_org_id());

-- RLS Policies for vehicle_costs
create policy if not exists "Org Members can view costs" on vehicle_costs
    for select using (organization_id = get_auth_org_id());

create policy if not exists "Org Members can insert costs" on vehicle_costs
    for insert with check (organization_id = get_auth_org_id());

create policy if not exists "Org Members can update costs" on vehicle_costs
    for update using (organization_id = get_auth_org_id());

create policy if not exists "Org Members can delete costs" on vehicle_costs
    for delete using (organization_id = get_auth_org_id());

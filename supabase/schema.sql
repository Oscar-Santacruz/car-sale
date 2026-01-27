-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CURRENCY: All monetary values (numeric fields) are in PYG (Guaraníes Paraguayos)

-- Organizations (Tenants)
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles (Users linked to Auth and Organizations)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  organization_id uuid references organizations on delete set null,
  role text check (role in ('admin', 'operator')) default 'operator',
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clients
create table clients (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  name text not null,
  ci text not null, -- Cédula de Identidad
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vehicles (Inventory)
create table vehicles (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  cod text, -- Generated code
  brand text not null,
  model text not null,
  year integer not null,
  vin text, -- N° Chasis
  plate text, -- Chapa
  color text,
  
  -- Costs & Status
  purchase_price numeric, -- Costo Origen
  freight_cost numeric, -- Flete
  import_cost numeric, -- Despacho
  total_cost numeric,
  
  list_price numeric not null, -- Precio de Lista
  status text check (status in ('available', 'reserved', 'sold')) default 'available',
  
  details jsonb, -- Flexible field for: Cambio de Volante, Tapizado, Combustible, etc.
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sales
create table sales (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  client_id uuid references clients on delete restrict not null,
  vehicle_id uuid references vehicles on delete restrict not null,
  
  sale_date timestamp with time zone default timezone('utc'::text, now()) not null,
  
  total_amount numeric not null, -- Precio Final de Venta
  down_payment numeric not null, -- Entrega Inicial
  balance numeric not null, -- Saldo a Financiar
  
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Installments (Cuotas)
create table installments (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references sales on delete cascade not null,
  organization_id uuid references organizations on delete cascade not null,
  
  number integer not null, -- Cuota N°
  due_date date not null,
  amount numeric not null,
  
  status text check (status in ('pending', 'paid', 'partial')) default 'pending',
  payment_date timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table clients enable row level security;
alter table vehicles enable row level security;
alter table sales enable row level security;
alter table installments enable row level security;

-- Helper function to get current user's organization
create or replace function get_auth_org_id()
returns uuid
language sql stable
as $$
  select organization_id from profiles where id = auth.uid()
$$;

-- Policies

-- Profiles: Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Organizations: Users can view their own organization
create policy "Users can view own organization" on organizations
  for select using (id = get_auth_org_id());

-- Clients: View/Edit based on Org
create policy "Org Members can view clients" on clients
  for select using (organization_id = get_auth_org_id());
create policy "Org Members can insert clients" on clients
  for insert with check (organization_id = get_auth_org_id());
create policy "Org Members can update clients" on clients
  for update using (organization_id = get_auth_org_id());

-- Vehicles: View/Edit based on Org
create policy "Org Members can view vehicles" on vehicles
  for select using (organization_id = get_auth_org_id());
create policy "Org Members can insert vehicles" on vehicles
  for insert with check (organization_id = get_auth_org_id());
create policy "Org Members can update vehicles" on vehicles
  for update using (organization_id = get_auth_org_id());

-- Sales: View/Edit based on Org
create policy "Org Members can view sales" on sales
  for select using (organization_id = get_auth_org_id());
create policy "Org Members can insert sales" on sales
  for insert with check (organization_id = get_auth_org_id());
create policy "Org Members can update sales" on sales
  for update using (organization_id = get_auth_org_id());

-- Installments: View/Edit based on Org
create policy "Org Members can view installments" on installments
  for select using (organization_id = get_auth_org_id());
create policy "Org Members can insert installments" on installments
  for insert with check (organization_id = get_auth_org_id());
create policy "Org Members can update installments" on installments
  for update using (organization_id = get_auth_org_id());

-- Admin-only policies (Example: Accessing Profit Reports would be handled in UI logic usually, but data access is uniform for now)
-- Refinement: Admins can do everything, Operators maybe restricted. For MVP, allowing both to read/write operational data is fine.

-- TRIGGER: Auto-create Profile and Default Organization on Sign Up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_org_id uuid;
begin
  -- 1. Create a new Organization for the user
  insert into public.organizations (name)
  values (coalesce(new.raw_user_meta_data->>'company_name', 'Mi Playa de Autos'))
  returning id into new_org_id;

  -- 2. Create the Profile linked to the Org
  insert into public.profiles (id, organization_id, email, role)
  values (
    new.id, 
    new_org_id, 
    new.email,
    'admin' -- First user is always admin of their own org
  );
  
  return new;
end;
$$;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


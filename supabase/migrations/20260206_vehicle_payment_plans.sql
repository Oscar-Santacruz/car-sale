-- Create vehicle_payment_plans table
CREATE TABLE IF NOT EXISTS vehicle_payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    months INTEGER NOT NULL CHECK (months > 0),
    annual_interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (annual_interest_rate >= 0),
    suggested_down_payment NUMERIC(12,2) CHECK (suggested_down_payment >= 0),
    suggested_down_payment_percentage NUMERIC(5,2) CHECK (suggested_down_payment_percentage >= 0 AND suggested_down_payment_percentage <= 100),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by vehicle
CREATE INDEX IF NOT EXISTS idx_vehicle_payment_plans_vehicle ON vehicle_payment_plans(vehicle_id);

-- Enable RLS
ALTER TABLE vehicle_payment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to read, admins to modify
CREATE POLICY "Allow authenticated users to read payment plans"
    ON vehicle_payment_plans FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert payment plans"
    ON vehicle_payment_plans FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update payment plans"
    ON vehicle_payment_plans FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete payment plans"
    ON vehicle_payment_plans FOR DELETE
    TO authenticated
    USING (true);

-- Add reinforcements column to vehicle_payment_plans table
ALTER TABLE vehicle_payment_plans 
ADD COLUMN IF NOT EXISTS reinforcements JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN vehicle_payment_plans.reinforcements IS 'Array of reinforcement payments configuration (month, amount)';

-- Script to clean all vehicles and sales data
-- WARNING: This will permanently delete all vehicles, sales, installments, and vehicle costs
-- Make sure to backup your data before running this script

DO $$
BEGIN
    RAISE NOTICE 'Starting cleanup...';

    -- 1. Delete installments (depends on sales)
    DELETE FROM installments;
    RAISE NOTICE 'Deleted all installments';

    -- 2. Delete sales (depends on vehicles and clients)
    DELETE FROM sales;
    RAISE NOTICE 'Deleted all sales';

    -- 3. Delete vehicle costs (depends on vehicles)
    DELETE FROM vehicle_costs;
    RAISE NOTICE 'Deleted all vehicle costs';

    -- 4. Delete vehicles
    DELETE FROM vehicles;
    RAISE NOTICE 'Deleted all vehicles';

    RAISE NOTICE 'Cleanup completed successfully!';
END $$;

-- Verification queries
SELECT 'vehicles' as table_name, COUNT(*) as remaining_records FROM vehicles
UNION ALL
SELECT 'vehicle_costs', COUNT(*) FROM vehicle_costs
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'installments', COUNT(*) FROM installments;

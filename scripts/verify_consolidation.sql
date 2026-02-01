-- Verification Script
-- Run this to confirm all data belongs to a single organization.

DO $$
DECLARE
    org_count integer;
    profile_dist integer;
    client_dist integer;
    vehicle_dist integer;
BEGIN
    RAISE NOTICE '--- VERIFICATION UTILITIES ---';

    -- 1. Count Organizations
    SELECT COUNT(*) INTO org_count FROM organizations;
    RAISE NOTICE 'Total Organizations: %', org_count;

    -- 2. Check Profiles Distribution (Should be 1 distinct org_id)
    SELECT COUNT(DISTINCT organization_id) INTO profile_dist FROM profiles;
    RAISE NOTICE 'Distinct Orgs in Profiles: % (Should be 1)', profile_dist;

    -- 3. Check Clients Distribution
    SELECT COUNT(DISTINCT organization_id) INTO client_dist FROM clients;
    RAISE NOTICE 'Distinct Orgs in Clients: % (Should be 1)', client_dist;

    -- 4. Check Vehicles Distribution
    SELECT COUNT(DISTINCT organization_id) INTO vehicle_dist FROM vehicles;
    RAISE NOTICE 'Distinct Orgs in Vehicles: % (Should be 1)', vehicle_dist;

    -- 5. Show the Main Org ID
    RAISE NOTICE 'Main Organization ID used:';
END $$;

-- Run these select queries to see the actual data distribution
SELECT 'Profiles' as table_name, organization_id, count(*) FROM profiles GROUP BY organization_id;
SELECT 'Clients' as table_name, organization_id, count(*) FROM clients GROUP BY organization_id;
SELECT 'Vehicles' as table_name, organization_id, count(*) FROM vehicles GROUP BY organization_id;
SELECT 'Sales' as table_name, organization_id, count(*) FROM sales GROUP BY organization_id;

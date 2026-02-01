-- Migration: Consolidate Organizations (Singleton Pattern)

DO $$
DECLARE
    main_org_id uuid;
    count_orgs integer;
BEGIN
    -- 1. Identify or Create the "Main" Organization
    -- We pick the oldest one or just the first limit 1
    SELECT id INTO main_org_id FROM organizations ORDER BY created_at ASC LIMIT 1;
    
    IF main_org_id IS NULL THEN
        RAISE NOTICE 'No organization found. Creating default.';
        INSERT INTO organizations (name) VALUES ('Organización Principal') RETURNING id INTO main_org_id;
    ELSE
        RAISE NOTICE 'Found existing main organization: %', main_org_id;
    END IF;

    -- 2. Update all PROFILES to use this Org
    UPDATE profiles SET organization_id = main_org_id WHERE organization_id != main_org_id OR organization_id IS NULL;
    RAISE NOTICE 'Updated Profiles';

    -- 3. Update CLIENTS
    UPDATE clients SET organization_id = main_org_id WHERE organization_id != main_org_id;
    RAISE NOTICE 'Updated Clients';

    -- 4. Update VEHICLES
    UPDATE vehicles SET organization_id = main_org_id WHERE organization_id != main_org_id;
    RAISE NOTICE 'Updated Vehicles';

    -- 5. Update SALES
    UPDATE sales SET organization_id = main_org_id WHERE organization_id != main_org_id;
    RAISE NOTICE 'Updated Sales';

    -- 6. Update INSTALLMENTS
    UPDATE installments SET organization_id = main_org_id WHERE organization_id != main_org_id;
    RAISE NOTICE 'Updated Installments';

    -- 7. Update Parametric Tables (if they have org_id)
    -- Checking schema: brands, models, taxes have org_id? 
    -- Assuming they might from usage in settings-actions.ts: "insert({ name, organization_id })"
    
    BEGIN
        UPDATE brands SET organization_id = main_org_id WHERE organization_id != main_org_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;
    
    BEGIN
        UPDATE models SET organization_id = main_org_id WHERE organization_id != main_org_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;

    BEGIN
        UPDATE taxes SET organization_id = main_org_id WHERE organization_id != main_org_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;
    
    BEGIN
        UPDATE cost_concepts SET organization_id = main_org_id WHERE organization_id != main_org_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;

    -- 8. Reset handle_new_user trigger logic in case it hasn't been applied via schema.sql yet (Redundant but safe)
    -- (We assume the user applied the code change, but we can't easily alter function in DO block without exec string, 
    -- so we skip re-declaring function here to avoid complexity. The schema.sql update handles new users).

    -- 9. Cleanup (Optional: Delete other organizations)
    -- DELETE FROM organizations WHERE id != main_org_id;
    -- RAISE NOTICE 'Deleted unused organizations';

END $$;

-- Complete Navigation System Setup
-- Run this script to ensure all navigation components are working correctly

-- Step 1: Run CMS schema setup (if not already done)
\i 'cms-schema-setup.sql'

-- Step 2: Fix navigation hierarchy function
\i 'fix-navigation-hierarchy.sql'

-- Step 3: Populate navigation with comprehensive data
\i 'cms-navigation-migration.sql'

-- Final verification
DO $$
DECLARE
    nav_result RECORD;
    nav_count INTEGER;
BEGIN
    -- Count total navigation items
    SELECT COUNT(*) INTO nav_count FROM header_navigation;

    RAISE NOTICE '=== Navigation System Setup Complete ===';
    RAISE NOTICE 'Total navigation items created: %', nav_count;

    -- Test the hierarchy function
    FOR nav_result IN SELECT * FROM get_navigation_hierarchy() LIMIT 5 LOOP
        RAISE NOTICE 'Navigation item: % (type: %, children: %)',
            nav_result.label,
            nav_result.nav_type,
            jsonb_array_length(nav_result.children);
    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Navigation system is ready!';
    RAISE NOTICE 'You can now refresh your frontend application.';
    RAISE NOTICE '========================================';
END $$;
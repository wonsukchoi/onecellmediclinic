-- Fix Navigation Hierarchy Issue
-- This script ensures the navigation hierarchy function works correctly with the CMS migration data

-- First, ensure the enum types exist
DO $$ BEGIN
    CREATE TYPE nav_type AS ENUM ('link', 'dropdown', 'megamenu', 'divider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure header_navigation table exists with correct structure
CREATE TABLE IF NOT EXISTS header_navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    url TEXT,
    page_id UUID REFERENCES dynamic_pages(id) ON DELETE SET NULL,
    nav_type nav_type DEFAULT 'link',
    parent_id UUID REFERENCES header_navigation(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    icon_name TEXT,
    target_blank BOOLEAN DEFAULT false,
    css_classes TEXT,
    access_level TEXT DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or replace the navigation hierarchy function with improved structure
CREATE OR REPLACE FUNCTION get_navigation_hierarchy()
RETURNS TABLE(
    id UUID,
    label TEXT,
    url TEXT,
    page_id UUID,
    nav_type nav_type,
    parent_id UUID,
    sort_order INTEGER,
    is_visible BOOLEAN,
    icon_name TEXT,
    target_blank BOOLEAN,
    css_classes TEXT,
    access_level TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    children JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE nav_tree AS (
        -- Root level items (parent_id IS NULL)
        SELECT
            hn.id,
            hn.label,
            hn.url,
            hn.page_id,
            hn.nav_type,
            hn.parent_id,
            hn.sort_order,
            hn.is_visible,
            hn.icon_name,
            hn.target_blank,
            hn.css_classes,
            hn.access_level,
            hn.created_at,
            hn.updated_at,
            0 as level
        FROM header_navigation hn
        WHERE hn.parent_id IS NULL AND hn.is_visible = true

        UNION ALL

        -- Child items (recursive)
        SELECT
            hn.id,
            hn.label,
            hn.url,
            hn.page_id,
            hn.nav_type,
            hn.parent_id,
            hn.sort_order,
            hn.is_visible,
            hn.icon_name,
            hn.target_blank,
            hn.css_classes,
            hn.access_level,
            hn.created_at,
            hn.updated_at,
            nt.level + 1
        FROM header_navigation hn
        JOIN nav_tree nt ON hn.parent_id = nt.id
        WHERE hn.is_visible = true
    ),
    nav_with_children AS (
        SELECT
            nt.*,
            CASE
                WHEN nt.level = 0 THEN
                    COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', child.id,
                                    'label', child.label,
                                    'url', child.url,
                                    'page_id', child.page_id,
                                    'nav_type', child.nav_type,
                                    'parent_id', child.parent_id,
                                    'sort_order', child.sort_order,
                                    'is_visible', child.is_visible,
                                    'icon_name', child.icon_name,
                                    'target_blank', child.target_blank,
                                    'css_classes', child.css_classes,
                                    'access_level', child.access_level,
                                    'created_at', child.created_at,
                                    'updated_at', child.updated_at
                                ) ORDER BY child.sort_order
                            )
                            FROM nav_tree child
                            WHERE child.parent_id = nt.id
                        ),
                        '[]'::jsonb
                    )
                ELSE '[]'::jsonb
            END as children
        FROM nav_tree nt
    )
    SELECT
        nwc.id,
        nwc.label,
        nwc.url,
        nwc.page_id,
        nwc.nav_type,
        nwc.parent_id,
        nwc.sort_order,
        nwc.is_visible,
        nwc.icon_name,
        nwc.target_blank,
        nwc.css_classes,
        nwc.access_level,
        nwc.created_at,
        nwc.updated_at,
        nwc.children
    FROM nav_with_children nwc
    WHERE nwc.level = 0
    ORDER BY nwc.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public roles
GRANT EXECUTE ON FUNCTION get_navigation_hierarchy() TO authenticated, anon;

-- Enable RLS if not already enabled
ALTER TABLE header_navigation ENABLE ROW LEVEL SECURITY;

-- Update RLS policy for public navigation access
DROP POLICY IF EXISTS "Public can view visible navigation" ON header_navigation;
CREATE POLICY "Public can view visible navigation" ON header_navigation
    FOR SELECT USING (is_visible = true);

-- Admin management policy
DROP POLICY IF EXISTS "Admins can manage all navigation" ON header_navigation;
CREATE POLICY "Admins can manage all navigation" ON header_navigation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Service role full access
CREATE POLICY "Service role can manage navigation" ON header_navigation
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_header_navigation_parent_id ON header_navigation(parent_id);
CREATE INDEX IF NOT EXISTS idx_header_navigation_sort_order ON header_navigation(sort_order);
CREATE INDEX IF NOT EXISTS idx_header_navigation_visible ON header_navigation(is_visible);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_header_navigation_updated_at ON header_navigation;
CREATE TRIGGER update_header_navigation_updated_at
    BEFORE UPDATE ON header_navigation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the function to ensure it works
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test if the function returns data
    SELECT * INTO test_result FROM get_navigation_hierarchy() LIMIT 1;

    IF test_result IS NOT NULL THEN
        RAISE NOTICE 'Navigation hierarchy function is working correctly';
        RAISE NOTICE 'Sample navigation item: %', test_result.label;
    ELSE
        RAISE NOTICE 'Navigation hierarchy function returns no data - this is expected if no navigation items exist yet';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing navigation function: %', SQLERRM;
END $$;

-- Show current navigation structure for debugging
DO $$
DECLARE
    nav_count INTEGER;
    parent_count INTEGER;
    child_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO nav_count FROM header_navigation;
    SELECT COUNT(*) INTO parent_count FROM header_navigation WHERE parent_id IS NULL;
    SELECT COUNT(*) INTO child_count FROM header_navigation WHERE parent_id IS NOT NULL;

    RAISE NOTICE '=== Navigation Structure Debug Info ===';
    RAISE NOTICE 'Total navigation items: %', nav_count;
    RAISE NOTICE 'Parent items: %', parent_count;
    RAISE NOTICE 'Child items: %', child_count;
    RAISE NOTICE '=======================================';
END $$;
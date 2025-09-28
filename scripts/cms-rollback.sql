-- =====================================================
-- CMS System Rollback Script for Supabase
-- =====================================================
-- This script completely removes the CMS system
-- Use with caution - this will delete ALL CMS data
-- Run this in Supabase SQL Editor if you need to rollback
-- =====================================================

-- Start transaction for atomic rollback
BEGIN;

-- =====================================================
-- DROP FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS get_navigation_hierarchy();
DROP FUNCTION IF EXISTS get_page_by_slug(TEXT);
DROP FUNCTION IF EXISTS increment_page_views(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- DROP TABLES (CASCADE removes all dependent objects)
-- =====================================================
DROP TABLE IF EXISTS page_analytics CASCADE;
DROP TABLE IF EXISTS page_blocks CASCADE;
DROP TABLE IF EXISTS header_navigation CASCADE;
DROP TABLE IF EXISTS page_templates CASCADE;
DROP TABLE IF EXISTS dynamic_pages CASCADE;

-- =====================================================
-- DROP ENUM TYPES
-- =====================================================
DROP TYPE IF EXISTS page_status CASCADE;
DROP TYPE IF EXISTS block_type CASCADE;
DROP TYPE IF EXISTS nav_type CASCADE;

-- =====================================================
-- COMMIT ROLLBACK
-- =====================================================
COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Verify rollback completed successfully
SELECT 'CMS System rollback completed!' as status;

-- Check that tables are removed
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%page%' OR table_name = 'header_navigation');

-- Check that types are removed
SELECT typname
FROM pg_type
WHERE typname IN ('page_status', 'block_type', 'nav_type');
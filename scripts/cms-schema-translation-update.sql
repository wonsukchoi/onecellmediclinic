-- Add translation support to header_navigation table
-- This adds English translations alongside Korean labels

BEGIN;

-- Add label_en column for English translations
ALTER TABLE header_navigation
ADD COLUMN IF NOT EXISTS label_en TEXT;

-- Update the get_navigation_hierarchy function to support language parameter
CREATE OR REPLACE FUNCTION get_navigation_hierarchy(lang TEXT DEFAULT 'kr')
RETURNS TABLE(
    id UUID,
    label TEXT,
    url TEXT,
    nav_type nav_type,
    parent_id UUID,
    sort_order INTEGER,
    is_visible BOOLEAN,
    icon_name TEXT,
    target_blank BOOLEAN,
    children JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE nav_tree AS (
        -- Root level items
        SELECT
            hn.id,
            CASE
                WHEN lang = 'en' AND hn.label_en IS NOT NULL AND hn.label_en != ''
                THEN hn.label_en
                ELSE hn.label
            END as label,
            hn.url,
            hn.nav_type,
            hn.parent_id,
            hn.sort_order,
            hn.is_visible,
            hn.icon_name,
            hn.target_blank,
            0 as level,
            ARRAY[hn.sort_order] as path
        FROM header_navigation hn
        WHERE hn.parent_id IS NULL AND hn.is_visible = true

        UNION ALL

        -- Child items
        SELECT
            hn.id,
            CASE
                WHEN lang = 'en' AND hn.label_en IS NOT NULL AND hn.label_en != ''
                THEN hn.label_en
                ELSE hn.label
            END as label,
            hn.url,
            hn.nav_type,
            hn.parent_id,
            hn.sort_order,
            hn.is_visible,
            hn.icon_name,
            hn.target_blank,
            nt.level + 1,
            nt.path || hn.sort_order
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
                                    'nav_type', child.nav_type,
                                    'sort_order', child.sort_order,
                                    'icon_name', child.icon_name,
                                    'target_blank', child.target_blank
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
        nwc.nav_type,
        nwc.parent_id,
        nwc.sort_order,
        nwc.is_visible,
        nwc.icon_name,
        nwc.target_blank,
        nwc.children
    FROM nav_with_children nwc
    WHERE nwc.level = 0
    ORDER BY nwc.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the updated function
GRANT EXECUTE ON FUNCTION get_navigation_hierarchy(TEXT) TO authenticated, anon;

COMMIT;
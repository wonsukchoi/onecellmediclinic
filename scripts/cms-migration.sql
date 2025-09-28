-- =====================================================
-- CMS System Migration Script for Supabase
-- =====================================================
-- This migration sets up the complete CMS system for dynamic page management
-- Safe to run multiple times (idempotent)
-- Run this directly in Supabase SQL Editor
-- =====================================================

-- Start transaction for atomic migration
BEGIN;

-- =====================================================
-- ENUM TYPES
-- =====================================================
-- Drop existing enum types if they exist (for clean migration)
DROP TYPE IF EXISTS page_status CASCADE;
DROP TYPE IF EXISTS block_type CASCADE;
DROP TYPE IF EXISTS nav_type CASCADE;

-- Create enum types
CREATE TYPE page_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE block_type AS ENUM ('text', 'image', 'video', 'gallery', 'cta', 'spacer', 'html');
CREATE TYPE nav_type AS ENUM ('link', 'dropdown', 'megamenu', 'divider');

-- =====================================================
-- DROP EXISTING OBJECTS (for clean migration)
-- =====================================================
-- Drop existing functions
DROP FUNCTION IF EXISTS get_navigation_hierarchy();
DROP FUNCTION IF EXISTS get_page_by_slug(TEXT);
DROP FUNCTION IF EXISTS increment_page_views(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop existing tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS page_analytics CASCADE;
DROP TABLE IF EXISTS page_blocks CASCADE;
DROP TABLE IF EXISTS header_navigation CASCADE;
DROP TABLE IF EXISTS page_templates CASCADE;
DROP TABLE IF EXISTS dynamic_pages CASCADE;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Dynamic Pages table
CREATE TABLE dynamic_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    keywords TEXT,
    meta_title TEXT,
    meta_description TEXT,
    template_id TEXT DEFAULT 'default',
    status page_status DEFAULT 'draft',
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    seo_canonical_url TEXT,
    seo_og_image TEXT,
    custom_css TEXT,
    custom_js TEXT
);

-- Page Blocks table for content management
CREATE TABLE page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES dynamic_pages(id) ON DELETE CASCADE,
    block_type block_type NOT NULL,
    title TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    styles JSONB DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Header Navigation table
CREATE TABLE header_navigation (
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
    access_level TEXT DEFAULT 'public', -- public, member, admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Templates table for different layouts
CREATE TABLE page_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    template_code TEXT NOT NULL,
    css_classes TEXT,
    available_blocks TEXT[] DEFAULT ARRAY['text', 'image', 'video', 'gallery', 'cta'],
    is_active BOOLEAN DEFAULT true,
    preview_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Analytics table for tracking
CREATE TABLE page_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES dynamic_pages(id) ON DELETE CASCADE,
    visitor_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    time_on_page INTEGER, -- seconds
    bounce BOOLEAN DEFAULT false
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX idx_dynamic_pages_slug ON dynamic_pages(slug);
CREATE INDEX idx_dynamic_pages_status ON dynamic_pages(status);
CREATE INDEX idx_dynamic_pages_published_at ON dynamic_pages(published_at DESC);
CREATE INDEX idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX idx_page_blocks_sort_order ON page_blocks(sort_order);
CREATE INDEX idx_header_navigation_parent_id ON header_navigation(parent_id);
CREATE INDEX idx_header_navigation_sort_order ON header_navigation(sort_order);
CREATE INDEX idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX idx_page_analytics_visited_at ON page_analytics(visited_at DESC);

-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_dynamic_pages_updated_at
    BEFORE UPDATE ON dynamic_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_blocks_updated_at
    BEFORE UPDATE ON page_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_header_navigation_updated_at
    BEFORE UPDATE ON header_navigation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_templates_updated_at
    BEFORE UPDATE ON page_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE dynamic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE header_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Public read access for published pages
CREATE POLICY "Public can view published pages" ON dynamic_pages
    FOR SELECT USING (status = 'published'::page_status);

-- Public read access for page blocks of published pages
CREATE POLICY "Public can view blocks of published pages" ON page_blocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dynamic_pages
            WHERE dynamic_pages.id = page_blocks.page_id
            AND dynamic_pages.status = 'published'::page_status
        )
    );

-- Public read access for visible navigation
CREATE POLICY "Public can view visible navigation" ON header_navigation
    FOR SELECT USING (is_visible = true);

-- Public read access for active templates
CREATE POLICY "Public can view active templates" ON page_templates
    FOR SELECT USING (is_active = true);

-- Admin full access policies
CREATE POLICY "Admins can manage all pages" ON dynamic_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

CREATE POLICY "Admins can manage all page blocks" ON page_blocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

CREATE POLICY "Admins can manage all navigation" ON header_navigation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

CREATE POLICY "Admins can manage all templates" ON page_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Analytics policies
CREATE POLICY "Anyone can insert analytics" ON page_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON page_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- =====================================================
-- CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to get page hierarchy for navigation
CREATE OR REPLACE FUNCTION get_navigation_hierarchy()
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
            hn.label,
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
            hn.label,
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

-- Function to get page by slug
CREATE OR REPLACE FUNCTION get_page_by_slug(page_slug TEXT)
RETURNS TABLE(
    id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    keywords TEXT,
    meta_title TEXT,
    meta_description TEXT,
    template_id TEXT,
    status page_status,
    featured_image TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    view_count INTEGER,
    seo_canonical_url TEXT,
    seo_og_image TEXT,
    custom_css TEXT,
    custom_js TEXT,
    blocks JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dp.id,
        dp.title,
        dp.slug,
        dp.description,
        dp.keywords,
        dp.meta_title,
        dp.meta_description,
        dp.template_id,
        dp.status,
        dp.featured_image,
        dp.published_at,
        dp.created_at,
        dp.updated_at,
        dp.view_count,
        dp.seo_canonical_url,
        dp.seo_og_image,
        dp.custom_css,
        dp.custom_js,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', pb.id,
                        'block_type', pb.block_type,
                        'title', pb.title,
                        'content', pb.content,
                        'styles', pb.styles,
                        'sort_order', pb.sort_order,
                        'is_visible', pb.is_visible
                    ) ORDER BY pb.sort_order
                )
                FROM page_blocks pb
                WHERE pb.page_id = dp.id AND pb.is_visible = true
            ),
            '[]'::jsonb
        ) as blocks
    FROM dynamic_pages dp
    WHERE dp.slug = page_slug AND dp.status = 'published'::page_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment page view count
CREATE OR REPLACE FUNCTION increment_page_views(page_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE dynamic_pages
    SET view_count = view_count + 1
    WHERE slug = page_slug AND status = 'published'::page_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_navigation_hierarchy() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_page_by_slug(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_page_views(TEXT) TO authenticated, anon;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default page templates
INSERT INTO page_templates (name, description, template_code, available_blocks) VALUES
('default', '기본 페이지 템플릿', 'default-page', ARRAY['text', 'image', 'video', 'gallery', 'cta', 'spacer']),
('landing', '랜딩 페이지 템플릿', 'landing-page', ARRAY['text', 'image', 'video', 'cta']),
('article', '아티클 페이지 템플릿', 'article-page', ARRAY['text', 'image', 'gallery']),
('gallery', '갤러리 페이지 템플릿', 'gallery-page', ARRAY['gallery', 'image', 'text']);

-- Insert default header navigation items
INSERT INTO header_navigation (label, url, nav_type, sort_order, is_visible) VALUES
('홈', '/', 'link'::nav_type, 1, true),
('시술안내', '/procedures', 'dropdown'::nav_type, 2, true),
('의료진', '/staff', 'link'::nav_type, 3, true),
('시설안내', '/facility', 'link'::nav_type, 4, true),
('갤러리', '/events', 'link'::nav_type, 5, true),
('온라인상담', '/consultation', 'link'::nav_type, 6, true),
('예약하기', '/reservation', 'link'::nav_type, 7, true);

-- Insert dropdown items for procedures
WITH procedures_parent AS (
    SELECT id FROM header_navigation WHERE label = '시술안내' LIMIT 1
)
INSERT INTO header_navigation (label, url, nav_type, parent_id, sort_order, is_visible)
SELECT '시술 개요', '/procedures', 'link'::nav_type, procedures_parent.id, 1, true FROM procedures_parent
UNION ALL
SELECT '안면윤곽', '/procedures/facial-contouring', 'link'::nav_type, procedures_parent.id, 2, true FROM procedures_parent
UNION ALL
SELECT '눈성형', '/procedures/eye-surgery', 'link'::nav_type, procedures_parent.id, 3, true FROM procedures_parent
UNION ALL
SELECT '코성형', '/procedures/nose-surgery', 'link'::nav_type, procedures_parent.id, 4, true FROM procedures_parent
UNION ALL
SELECT '가슴성형', '/procedures/breast-surgery', 'link'::nav_type, procedures_parent.id, 5, true FROM procedures_parent
UNION ALL
SELECT '리프팅', '/procedures/lifting', 'link'::nav_type, procedures_parent.id, 6, true FROM procedures_parent;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================
COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries after migration to verify success:

-- SELECT 'Migration completed successfully!' as status;
-- SELECT COUNT(*) as template_count FROM page_templates;
-- SELECT COUNT(*) as navigation_count FROM header_navigation;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%page%' OR table_name = 'header_navigation';
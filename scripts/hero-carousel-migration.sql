-- ===============================================
-- Hero Carousel Migration - OneCell Medical Clinic
-- ===============================================
-- Based on hero carousel structure from reference medical sites
-- Creates hero_carousel table and populates with medical clinic content
-- Replaces hardcoded carousel data with dynamic database content
-- ===============================================

-- Create hero_carousel table
CREATE TABLE IF NOT EXISTS hero_carousel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_kr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_kr TEXT NOT NULL,
    subtitle_en TEXT NOT NULL,
    description_kr TEXT NOT NULL,
    description_en TEXT NOT NULL,
    background_image_url TEXT NOT NULL,
    cta_text_kr TEXT NOT NULL,
    cta_text_en TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    text_position TEXT DEFAULT 'center' CHECK (text_position IN ('left', 'center', 'right')),
    overlay_opacity DECIMAL(3,2) DEFAULT 0.4,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hero_carousel_order ON hero_carousel(order_index);
CREATE INDEX IF NOT EXISTS idx_hero_carousel_active ON hero_carousel(is_active);

-- Enable RLS
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;

-- Public read access for active carousel items
CREATE POLICY "Public can view active carousel items" ON hero_carousel
    FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage carousel" ON hero_carousel
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.email = 'admin@onecellclinic.com' OR auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Create updated_at trigger
CREATE TRIGGER update_hero_carousel_updated_at
    BEFORE UPDATE ON hero_carousel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- INSERT HERO CAROUSEL DATA
-- ===============================================
-- Medical clinic focused carousel slides
-- Professional, trustworthy content for healthcare setting
-- ===============================================

INSERT INTO hero_carousel (
    title_kr, title_en, subtitle_kr, subtitle_en, description_kr, description_en,
    background_image_url, cta_text_kr, cta_text_en, cta_link,
    order_index, text_position, overlay_opacity
) VALUES
(
    '예쁨 급상승, 원셀 코성형',
    'Beauty Revolution: OneCell Nose Surgery',
    'SHORT × SELFIE',
    'SHORT × SELFIE',
    '독보적인 이유, 맞춤형 코성형으로 오랫동안 자연스럽게',
    'Unparalleled excellence with customized nose surgery for long-lasting, natural results',
    '/images/hero/nose-surgery-hero.jpg',
    '상담문의',
    'Book Consultation',
    '/reservation',
    1,
    'left',
    0.3
),
(
    '피부과 시그니처, 원셀 피부과',
    'Dermatology Signature: OneCell Skin Care',
    'DERM × SCIENCE',
    'DERM × SCIENCE',
    'VIP 프리미엄 케어 프로그램',
    'VIP Premium Care Program',
    '/images/hero/dermatology-hero.jpg',
    '더 알아보기',
    'Learn More',
    '/procedures/derma-package',
    2,
    'center',
    0.4
),
(
    '안전이 만든 아름다움',
    'Beauty Made Safe',
    'SAFE × PREMIUM',
    'SAFE × PREMIUM',
    '3D-CT 정밀 수술 시스템으로 더욱 안전하고 정밀한 시술',
    '3D-CT precision surgery system for safer and more precise procedures',
    '/images/hero/safety-technology-hero.jpg',
    '예약하기',
    'Book Appointment',
    '/reservation',
    3,
    'right',
    0.35
),
(
    '차별화된 안면윤곽',
    'Distinguished Facial Contouring',
    'CONTOUR × PRECISION',
    'CONTOUR × PRECISION',
    '개인별 맞춤 안면윤곽으로 자연스럽고 균형잡힌 얼굴형',
    'Personalized facial contouring for natural and balanced facial structure',
    '/images/hero/facial-contouring-hero.jpg',
    '시술 안내',
    'View Procedures',
    '/procedures/facial-contouring',
    4,
    'left',
    0.4
),
(
    '원셀만의 눈성형',
    'OneCell\'s Signature Eye Surgery',
    'BRIGHT × NATURAL',
    'BRIGHT × NATURAL',
    '또렷하고 자연스러운 눈매로 완성하는 매력적인 인상',
    'Attractive appearance with clear and natural eye contours',
    '/images/hero/eye-surgery-hero.jpg',
    '전문의 상담',
    'Expert Consultation',
    '/consultation',
    5,
    'center',
    0.4
),
(
    '프리미엄 안티에이징',
    'Premium Anti-Aging',
    'YOUTH × SCIENCE',
    'YOUTH × SCIENCE',
    '첨단 장비와 전문 기술로 되돌리는 젊음의 시간',
    'Turn back time with advanced equipment and expert techniques',
    '/images/hero/antiaging-hero.jpg',
    '시술 보기',
    'View Treatments',
    '/procedures/lifting',
    6,
    'right',
    0.35
),
(
    '체계적인 사후관리',
    'Systematic Aftercare',
    'CARE × TRUST',
    'CARE × TRUST',
    '수술 후에도 지속되는 전문적인 관리와 평생 책임제',
    'Professional care that continues after surgery with lifetime responsibility',
    '/images/hero/aftercare-hero.jpg',
    '관리 시스템',
    'Care System',
    '/about/aftercare',
    7,
    'left',
    0.4
),
(
    '첨단 의료 시설',
    'Advanced Medical Facilities',
    'TECH × SAFETY',
    'TECH × SAFETY',
    '최첨단 장비와 무균 시설로 보장하는 안전한 의료 환경',
    'Safe medical environment ensured by cutting-edge equipment and sterile facilities',
    '/images/hero/facility-hero.jpg',
    '시설 둘러보기',
    'Facility Tour',
    '/facility',
    8,
    'center',
    0.3
);

-- Grant permissions
GRANT SELECT ON hero_carousel TO authenticated, anon;

-- ===============================================
-- CREATE HELPER FUNCTIONS
-- ===============================================

-- Function to get active carousel items in order
CREATE OR REPLACE FUNCTION get_hero_carousel()
RETURNS TABLE(
    id UUID,
    title_kr TEXT,
    title_en TEXT,
    subtitle_kr TEXT,
    subtitle_en TEXT,
    description_kr TEXT,
    description_en TEXT,
    background_image_url TEXT,
    cta_text_kr TEXT,
    cta_text_en TEXT,
    cta_link TEXT,
    order_index INTEGER,
    text_position TEXT,
    overlay_opacity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hc.id,
        hc.title_kr,
        hc.title_en,
        hc.subtitle_kr,
        hc.subtitle_en,
        hc.description_kr,
        hc.description_en,
        hc.background_image_url,
        hc.cta_text_kr,
        hc.cta_text_en,
        hc.cta_link,
        hc.order_index,
        hc.text_position,
        hc.overlay_opacity
    FROM hero_carousel hc
    WHERE hc.is_active = true
    ORDER BY hc.order_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_hero_carousel() TO authenticated, anon;

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================
DO $$
BEGIN
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Hero Carousel Migration Complete!';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- hero_carousel table with RLS policies';
  RAISE NOTICE '- 8 medical clinic carousel slides';
  RAISE NOTICE '- Helper function get_hero_carousel()';
  RAISE NOTICE '- Proper indexing and triggers';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Add hero carousel images to /public/images/hero/';
  RAISE NOTICE '2. Update HeroSection.tsx to fetch from database';
  RAISE NOTICE '3. Remove hardcoded carousel data from component';
  RAISE NOTICE '===============================================';
END $$;

COMMIT;
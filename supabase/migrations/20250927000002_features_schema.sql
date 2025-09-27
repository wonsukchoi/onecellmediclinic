-- BRAUN-Inspired Features Database Schema for OneCell Medical Clinic
-- Run these commands in your Supabase SQL Editor after running database-setup.sql and database-enhancements.sql

-- Clean up any existing problematic data to avoid conflicts (only if table exists)
-- This removes any test data with well-known or invalid YouTube IDs that might cause duplicate key errors
-- Note: Deletion moved to after table creation

-- 1. Video Shorts (BraunShorts) - Medical video showcase
CREATE TABLE IF NOT EXISTS video_shorts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  view_count INTEGER DEFAULT 0,
  category VARCHAR(100) DEFAULT 'general',
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  tags TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clinic Features (Details That Make Difference)
CREATE TABLE IF NOT EXISTS clinic_features (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  category VARCHAR(100) DEFAULT 'general',
  stats_number VARCHAR(50),
  stats_label VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced Events (extending existing event_banners table)
ALTER TABLE event_banners
ADD COLUMN IF NOT EXISTS event_type VARCHAR(100) DEFAULT 'promotion',
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER,
ADD COLUMN IF NOT EXISTS registration_link TEXT,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS event_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_conditions TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 4. Selfie Reviews - Patient testimonials with photos
CREATE TABLE IF NOT EXISTS selfie_reviews (
  id BIGSERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_initial VARCHAR(10),
  procedure_type VARCHAR(255),
  procedure_id BIGINT,
  selfie_url TEXT NOT NULL,
  review_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  patient_age_range VARCHAR(20),
  treatment_date DATE,
  recovery_weeks INTEGER,
  consent_given BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  tags TEXT[],
  moderation_status VARCHAR(50) DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. YouTube Integration - Embedded videos showcase
CREATE TABLE IF NOT EXISTS youtube_videos (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  youtube_id VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clean up any existing problematic data to avoid conflicts
-- This removes any test data with well-known or invalid YouTube IDs that might cause duplicate key errors
DELETE FROM youtube_videos WHERE youtube_id IN ('dQw4w9WgXcQ', 'ABC123xyz456', 'DEF456uvw789', 'GHI789rst012');

-- 6. Differentiators (Why Choose Us)
CREATE TABLE IF NOT EXISTS differentiators (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  icon VARCHAR(100),
  icon_url TEXT,
  stats_number VARCHAR(50),
  stats_label VARCHAR(100),
  background_color VARCHAR(20) DEFAULT '#ffffff',
  text_color VARCHAR(20) DEFAULT '#333333',
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_shorts_category ON video_shorts(category, active, order_index);
CREATE INDEX IF NOT EXISTS idx_video_shorts_featured ON video_shorts(featured DESC, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_shorts_view_count ON video_shorts(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_clinic_features_category ON clinic_features(category, active, order_index);
CREATE INDEX IF NOT EXISTS idx_clinic_features_order ON clinic_features(order_index, active);

CREATE INDEX IF NOT EXISTS idx_event_banners_type ON event_banners(event_type, active);
CREATE INDEX IF NOT EXISTS idx_event_banners_featured ON event_banners(featured DESC, priority DESC);
CREATE INDEX IF NOT EXISTS idx_event_banners_deadline ON event_banners(registration_deadline);

CREATE INDEX IF NOT EXISTS idx_selfie_reviews_procedure ON selfie_reviews(procedure_id, featured DESC);
CREATE INDEX IF NOT EXISTS idx_selfie_reviews_verified ON selfie_reviews(verified, moderation_status);
CREATE INDEX IF NOT EXISTS idx_selfie_reviews_featured ON selfie_reviews(featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_selfie_reviews_rating ON selfie_reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_category ON youtube_videos(category, active, order_index);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_featured ON youtube_videos(featured DESC, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_youtube_id ON youtube_videos(youtube_id);

CREATE INDEX IF NOT EXISTS idx_differentiators_order ON differentiators(order_index, active);
CREATE INDEX IF NOT EXISTS idx_differentiators_active ON differentiators(active);

-- Enable Row Level Security (RLS)
ALTER TABLE video_shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE selfie_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE differentiators ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Video Shorts: Public read access for active videos, authenticated write access
CREATE POLICY "Allow public read access to active video shorts" ON video_shorts
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage video shorts" ON video_shorts
  FOR ALL USING (auth.role() = 'authenticated');

-- Clinic Features: Public read access for active features, authenticated write access
CREATE POLICY "Allow public read access to active clinic features" ON clinic_features
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage clinic features" ON clinic_features
  FOR ALL USING (auth.role() = 'authenticated');

-- Selfie Reviews: Public read access for verified reviews, authenticated write access
CREATE POLICY "Allow public read access to verified selfie reviews" ON selfie_reviews
  FOR SELECT USING (verified = true AND moderation_status = 'approved' AND consent_given = true);

CREATE POLICY "Allow authenticated users to manage selfie reviews" ON selfie_reviews
  FOR ALL USING (auth.role() = 'authenticated');

-- YouTube Videos: Public read access for active videos, authenticated write access
CREATE POLICY "Allow public read access to active youtube videos" ON youtube_videos
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage youtube videos" ON youtube_videos
  FOR ALL USING (auth.role() = 'authenticated');

-- Differentiators: Public read access for active differentiators, authenticated write access
CREATE POLICY "Allow public read access to active differentiators" ON differentiators
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage differentiators" ON differentiators
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions for business logic

-- Function to increment video view count
CREATE OR REPLACE FUNCTION increment_video_view_count(video_id BIGINT, video_type VARCHAR DEFAULT 'shorts')
RETURNS VOID AS $$
BEGIN
  IF video_type = 'shorts' THEN
    UPDATE video_shorts
    SET view_count = view_count + 1
    WHERE id = video_id;
  ELSIF video_type = 'youtube' THEN
    UPDATE youtube_videos
    SET view_count = view_count + 1
    WHERE id = video_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update event participant count
CREATE OR REPLACE FUNCTION increment_event_participants(event_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  SELECT participants_count, max_participants
  INTO current_count, max_count
  FROM event_banners
  WHERE id = event_id;

  IF max_count IS NULL OR current_count < max_count THEN
    UPDATE event_banners
    SET participants_count = participants_count + 1
    WHERE id = event_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get featured content for homepage
CREATE OR REPLACE FUNCTION get_featured_content()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'video_shorts', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'video_url', video_url,
          'thumbnail_url', thumbnail_url,
          'description', description,
          'view_count', view_count,
          'category', category
        )
      )
      FROM video_shorts
      WHERE featured = true AND active = true
      ORDER BY order_index, created_at DESC
      LIMIT 6
    ),
    'clinic_features', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'description', description,
          'icon_url', icon_url,
          'image_url', image_url,
          'category', category,
          'stats_number', stats_number,
          'stats_label', stats_label
        )
      )
      FROM clinic_features
      WHERE active = true
      ORDER BY order_index, created_at DESC
      LIMIT 8
    ),
    'events', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'description', description,
          'image_url', image_url,
          'event_type', event_type,
          'discount_percentage', discount_percentage,
          'end_date', end_date,
          'registration_link', registration_link,
          'max_participants', max_participants,
          'participants_count', participants_count
        )
      )
      FROM event_banners
      WHERE active = true AND featured = true
      AND (end_date IS NULL OR end_date > NOW())
      ORDER BY priority DESC, created_at DESC
      LIMIT 4
    ),
    'selfie_reviews', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'patient_initial', patient_initial,
          'procedure_type', procedure_type,
          'selfie_url', selfie_url,
          'review_text', review_text,
          'rating', rating,
          'treatment_date', treatment_date
        )
      )
      FROM selfie_reviews
      WHERE verified = true AND featured = true AND consent_given = true
      AND moderation_status = 'approved'
      ORDER BY display_order, created_at DESC
      LIMIT 6
    ),
    'youtube_videos', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'youtube_id', youtube_id,
          'description', description,
          'category', category,
          'view_count', view_count,
          'thumbnail_url', thumbnail_url
        )
      )
      FROM youtube_videos
      WHERE featured = true AND active = true
      ORDER BY order_index, created_at DESC
      LIMIT 4
    ),
    'differentiators', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'subtitle', subtitle,
          'description', description,
          'icon', icon,
          'icon_url', icon_url,
          'stats_number', stats_number,
          'stats_label', stats_label,
          'background_color', background_color,
          'text_color', text_color
        )
      )
      FROM differentiators
      WHERE active = true
      ORDER BY order_index, created_at DESC
      LIMIT 6
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_video_shorts_updated_at BEFORE UPDATE ON video_shorts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_features_updated_at BEFORE UPDATE ON clinic_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_selfie_reviews_updated_at BEFORE UPDATE ON selfie_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_youtube_videos_updated_at BEFORE UPDATE ON youtube_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_differentiators_updated_at BEFORE UPDATE ON differentiators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional - remove in production)
-- Use ON CONFLICT to handle duplicate entries
INSERT INTO video_shorts (title, video_url, thumbnail_url, description, category, featured, order_index) VALUES
('원셀 메디 클리닉 소개', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', '원셀 메디 클리닉의 첨단 시설과 전문의를 소개합니다', 'introduction', true, 1),
('안전한 수술 과정', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', '환자 안전을 최우선으로 하는 수술 과정을 보여드립니다', 'safety', true, 2),
('회복 과정 가이드', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', '수술 후 빠른 회복을 위한 가이드라인입니다', 'recovery', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO clinic_features (title, description, icon_url, image_url, category, stats_number, stats_label, order_index) VALUES
('첨단 의료 장비', '최신 의료 기술과 첨단 장비로 안전하고 정확한 시술을 제공합니다', '/icons/medical-equipment.svg', '/images/equipment.jpg', 'technology', '100%', '최신 장비', 1),
('전문의 진료', '풍부한 경험과 전문성을 갖춘 의료진이 개인 맞춤 진료를 제공합니다', '/icons/doctor.svg', '/images/doctors.jpg', 'expertise', '15+', '년 경력', 2),
('안전한 시설', '철저한 위생 관리와 안전 시설로 환자의 건강을 보호합니다', '/icons/safety.svg', '/images/facility.jpg', 'safety', '24/7', '안전 관리', 3),
('개인 맞춤 상담', '환자 개인의 특성과 요구사항을 고려한 맞춤형 상담을 제공합니다', '/icons/consultation.svg', '/images/consultation.jpg', 'consultation', '1:1', '맞춤 상담', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert sample YouTube videos with unique IDs
-- Note: These are placeholder YouTube IDs for testing. Replace with real YouTube video IDs in production.
-- Each YouTube ID is 11 characters long and alphanumeric as per YouTube's format.
INSERT INTO youtube_videos (title, youtube_id, description, category, featured, order_index) VALUES
('원셀 메디 클리닉 시설 투어', 'XyZ9K3mP2nQ', '클린하고 안전한 원셀 메디 클리닉 시설을 둘러보세요', 'facility', true, 1),
('전문의 인터뷰', 'Lm8N5rT4vWx', '원셀 메디 클리닉 전문의가 들려주는 안전한 시술 이야기', 'interview', true, 2),
('환자 후기 영상', 'Qp7B6jH9sK2', '실제 환자들이 들려주는 진솔한 후기 영상입니다', 'testimonial', false, 3)
ON CONFLICT (youtube_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  featured = EXCLUDED.featured,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

INSERT INTO differentiators (title, subtitle, description, icon, stats_number, stats_label, order_index) VALUES
('안전한 시술', '환자 안전 최우선', '철저한 안전 관리 시스템과 응급 대응 체계로 환자의 안전을 보장합니다', 'shield-check', '0', '의료사고', 1),
('풍부한 경험', '15년 이상의 노하우', '오랜 경험과 수많은 케이스를 통해 축적된 전문성으로 최상의 결과를 제공합니다', 'award', '10,000+', '성공 케이스', 2),
('개인 맞춤 디자인', '나만의 아름다움', '개인의 특성과 라이프스타일을 고려한 맞춤형 디자인으로 자연스러운 아름다움을 완성합니다', 'user-circle', '100%', '맞춤 디자인', 3),
('사후관리 시스템', '평생 책임지는 관리', '수술 후에도 지속적인 관리와 상담으로 최상의 상태를 유지할 수 있도록 도와드립니다', 'heart', '평생', '사후관리', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO selfie_reviews (patient_name, patient_initial, procedure_type, selfie_url, review_text, rating, verified, featured, patient_age_range, treatment_date, recovery_weeks, consent_given, moderation_status, display_order) VALUES
('김**', '김**', '눈성형', '/images/reviews/selfie1.jpg', '자연스럽고 만족스러운 결과입니다. 회복도 빨랐어요!', 5, true, true, '20대', '2024-01-15', 2, true, 'approved', 1),
('이**', '이**', '코성형', '/images/reviews/selfie2.jpg', '원하던 라인으로 예쁘게 나왔어요. 추천합니다!', 5, true, true, '30대', '2024-02-10', 3, true, 'approved', 2),
('박**', '박**', '안면윤곽', '/images/reviews/selfie3.jpg', '전문적이고 세심한 상담과 시술에 감사드립니다.', 5, true, false, '20대', '2024-01-20', 4, true, 'approved', 3)
ON CONFLICT (id) DO NOTHING;
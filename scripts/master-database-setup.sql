-- ===============================================
-- MASTER DATABASE SETUP for OneCell Medical Clinic
-- ===============================================
-- This consolidated script contains ALL database setup requirements
-- Run this script in your Supabase SQL Editor for complete database setup
--
-- Consolidated from:
-- - database-setup.sql
-- - database-enhancements.sql
-- - features-schema.sql (20250927000002_features_schema.sql)
-- - fix-contact-rls-policy.sql
-- - fix-contact-submissions-final.sql
-- - fix-edge-function-rls.sql
-- ===============================================

-- ===============================================
-- STEP 1: BASIC TABLES (Core functionality)
-- ===============================================

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  service_type VARCHAR(100),
  message TEXT,
  preferred_contact VARCHAR(50) DEFAULT 'email',
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20),
  service_type VARCHAR(100) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_doctor VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  tags TEXT[],
  meta_title VARCHAR(500),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create event_banners table
CREATE TABLE IF NOT EXISTS event_banners (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text VARCHAR(100),
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience VARCHAR(100) DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  medical_history TEXT,
  allergies TEXT,
  role VARCHAR(20) DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- STEP 2: ENHANCED MEDICAL SYSTEM TABLES
-- ===============================================

-- Create procedure_categories table
CREATE TABLE IF NOT EXISTS procedure_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create procedures table
CREATE TABLE IF NOT EXISTS procedures (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES procedure_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  detailed_description TEXT,
  duration_minutes INTEGER,
  price_range VARCHAR(100),
  preparation_instructions TEXT,
  recovery_time VARCHAR(100),
  featured_image_url TEXT,
  gallery_images TEXT[],
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create providers table (doctors/practitioners)
CREATE TABLE IF NOT EXISTS providers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  specialization VARCHAR(255),
  bio TEXT,
  profile_image_url TEXT,
  years_experience INTEGER,
  education TEXT[],
  certifications TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  consultation_fee DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  availability_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance appointments table with additional columns
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS provider_id BIGINT REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS procedure_id BIGINT REFERENCES procedures(id),
ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) DEFAULT 'consultation',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_from BIGINT REFERENCES appointments(id);

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id BIGSERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20),
  patient_age INTEGER,
  consultation_type VARCHAR(100) NOT NULL,
  procedure_interest VARCHAR(255),
  concerns TEXT,
  medical_history TEXT,
  current_medications TEXT,
  preferred_contact_method VARCHAR(50) DEFAULT 'email',
  urgency_level VARCHAR(20) DEFAULT 'normal',
  photos TEXT[],
  status VARCHAR(20) DEFAULT 'new',
  assigned_provider_id BIGINT REFERENCES providers(id),
  response_notes TEXT,
  estimated_cost_range VARCHAR(100),
  recommended_procedures TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_items table for before/after photos
CREATE TABLE IF NOT EXISTS gallery_items (
  id BIGSERIAL PRIMARY KEY,
  procedure_id BIGINT REFERENCES procedures(id) ON DELETE CASCADE,
  provider_id BIGINT REFERENCES providers(id),
  title VARCHAR(255),
  description TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  additional_images TEXT[],
  patient_age_range VARCHAR(20),
  procedure_date DATE,
  recovery_weeks INTEGER,
  patient_testimonial TEXT,
  consent_given BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointment_availability table for provider schedules
CREATE TABLE IF NOT EXISTS appointment_availability (
  id BIGSERIAL PRIMARY KEY,
  provider_id BIGINT REFERENCES providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 60,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create procedure_provider_junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS procedure_providers (
  id BIGSERIAL PRIMARY KEY,
  procedure_id BIGINT REFERENCES procedures(id) ON DELETE CASCADE,
  provider_id BIGINT REFERENCES providers(id) ON DELETE CASCADE,
  experience_level VARCHAR(50) DEFAULT 'experienced',
  price_override DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(procedure_id, provider_id)
);

-- Create consultation_tracking table for real-time updates
CREATE TABLE IF NOT EXISTS consultation_tracking (
  id BIGSERIAL PRIMARY KEY,
  consultation_request_id BIGINT REFERENCES consultation_requests(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- STEP 3: FEATURES TABLES (BRAUN-Inspired Content)
-- ===============================================

-- Video Shorts (BraunShorts) - Medical video showcase
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

-- Clinic Features (Details That Make Difference)
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

-- Enhance event_banners table with additional columns
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

-- Selfie Reviews - Patient testimonials with photos (FIXED WITH PROPER FOREIGN KEY)
CREATE TABLE IF NOT EXISTS selfie_reviews (
  id BIGSERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_initial VARCHAR(10),
  procedure_type VARCHAR(255),
  procedure_id BIGINT REFERENCES procedures(id) ON DELETE SET NULL,  -- FIXED: Added proper foreign key constraint
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

-- YouTube Integration - Embedded videos showcase
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

-- Differentiators (Why Choose Us)
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

-- ===============================================
-- STEP 4: INDEXES FOR PERFORMANCE
-- ===============================================

-- Basic tables indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_event_banners_active ON event_banners(active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_event_banners_dates ON event_banners(start_date, end_date);

-- Enhanced medical system indexes
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_procedures_slug ON procedures(slug);
CREATE INDEX IF NOT EXISTS idx_procedures_active ON procedures(active, display_order);
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(active);
CREATE INDEX IF NOT EXISTS idx_providers_specialization ON providers(specialization);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_date ON appointments(provider_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmation ON appointments(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(patient_email);
CREATE INDEX IF NOT EXISTS idx_gallery_items_procedure ON gallery_items(procedure_id, featured DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_provider ON gallery_items(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointment_availability_provider_date ON appointment_availability(provider_id, date, available);
CREATE INDEX IF NOT EXISTS idx_procedure_providers_lookup ON procedure_providers(procedure_id, provider_id);

-- Features tables indexes
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

-- ===============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE selfie_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE differentiators ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 6: RLS POLICIES (Comprehensive & Fixed)
-- ===============================================

-- Drop ALL existing contact_submissions policies to start clean
DROP POLICY IF EXISTS "Allow public contact form submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable public contact form submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable authenticated users to view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable authenticated users to update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable authenticated users to delete contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "anonymous_insert_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "authenticated_insert_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "authenticated_select_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "authenticated_update_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "authenticated_delete_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable select for admin users" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public insert" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anon inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous insert" ON contact_submissions;
DROP POLICY IF EXISTS "Service role full access" ON contact_submissions;
DROP POLICY IF EXISTS "Users view own submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anon select for rate limit" ON contact_submissions;

-- Contact submissions: FINAL FIXED POLICIES
CREATE POLICY "contact_submissions_anon_insert" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "contact_submissions_service_full_access" ON contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "contact_submissions_authenticated_select" ON contact_submissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "contact_submissions_authenticated_update" ON contact_submissions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "contact_submissions_authenticated_delete" ON contact_submissions
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "contact_submissions_anon_select_rate_limit" ON contact_submissions
  FOR SELECT TO anon USING (true);

-- Appointments: Allow insert for everyone, select/update for authenticated users
CREATE POLICY "Allow public appointment booking" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view appointments" ON appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view their own appointments" ON appointments
  FOR SELECT USING (patient_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow authenticated users to manage appointments" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

-- Blog posts: Public read access for published posts, authenticated write access
CREATE POLICY "Allow public read access to published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Allow authenticated users to manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Event banners: Public read access for active banners
CREATE POLICY "Allow public read access to active event banners" ON event_banners
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage event banners" ON event_banners
  FOR ALL USING (auth.role() = 'authenticated');

-- User profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Procedure categories: Public read access
CREATE POLICY "Allow public read access to active procedure categories" ON procedure_categories
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage procedure categories" ON procedure_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Procedures: Public read access for active procedures
CREATE POLICY "Allow public read access to active procedures" ON procedures
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage procedures" ON procedures
  FOR ALL USING (auth.role() = 'authenticated');

-- Providers: Public read access for active providers
CREATE POLICY "Allow public read access to active providers" ON providers
  FOR SELECT USING (active = true);

CREATE POLICY "Allow providers to manage their own profile" ON providers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to manage providers" ON providers
  FOR ALL USING (auth.role() = 'authenticated');

-- Consultation requests: Allow public insert, authenticated users can view/manage
CREATE POLICY "Allow public consultation requests" ON consultation_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view consultation requests" ON consultation_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view their own consultation requests" ON consultation_requests
  FOR SELECT USING (patient_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow authenticated users to update consultation requests" ON consultation_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Gallery items: Public read access, authenticated write access
CREATE POLICY "Allow public read access to gallery items" ON gallery_items
  FOR SELECT USING (consent_given = true);

CREATE POLICY "Allow authenticated users to manage gallery items" ON gallery_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Appointment availability: Public read access, providers can manage their own
CREATE POLICY "Allow public read access to availability" ON appointment_availability
  FOR SELECT USING (available = true);

CREATE POLICY "Allow providers to manage their availability" ON appointment_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow authenticated users to manage availability" ON appointment_availability
  FOR ALL USING (auth.role() = 'authenticated');

-- Procedure providers: Public read, authenticated write
CREATE POLICY "Allow public read access to procedure providers" ON procedure_providers
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage procedure providers" ON procedure_providers
  FOR ALL USING (auth.role() = 'authenticated');

-- Consultation tracking: Authenticated users only
CREATE POLICY "Allow authenticated users to manage consultation tracking" ON consultation_tracking
  FOR ALL USING (auth.role() = 'authenticated');

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

-- ===============================================
-- STEP 7: GRANT PERMISSIONS
-- ===============================================

-- Grant necessary permissions to anon role for contact submissions
GRANT INSERT, SELECT ON contact_submissions TO anon;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO anon;

-- Grant permissions to authenticated role
GRANT INSERT ON contact_submissions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO authenticated;

-- ===============================================
-- STEP 8: FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to check provider availability
CREATE OR REPLACE FUNCTION check_provider_availability(
  provider_id_param BIGINT,
  requested_date DATE,
  requested_time TIME,
  duration_minutes_param INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  availability_count INTEGER;
  conflicting_appointments INTEGER;
BEGIN
  -- Check if provider has availability slot
  SELECT COUNT(*) INTO availability_count
  FROM appointment_availability aa
  WHERE aa.provider_id = provider_id_param
    AND aa.date = requested_date
    AND aa.start_time <= requested_time
    AND aa.end_time >= (requested_time + (duration_minutes_param || ' minutes')::INTERVAL)::TIME
    AND aa.available = true
    AND aa.current_bookings < aa.max_bookings;

  -- Check for conflicting appointments
  SELECT COUNT(*) INTO conflicting_appointments
  FROM appointments a
  WHERE a.provider_id = provider_id_param
    AND a.preferred_date = requested_date
    AND a.status NOT IN ('cancelled', 'completed')
    AND (
      (a.preferred_time <= requested_time AND
       (a.preferred_time + (COALESCE(a.duration_minutes, 60) || ' minutes')::INTERVAL)::TIME > requested_time)
      OR
      (requested_time <= a.preferred_time AND
       (requested_time + (duration_minutes_param || ' minutes')::INTERVAL)::TIME > a.preferred_time)
    );

  RETURN availability_count > 0 AND conflicting_appointments = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set confirmation code on appointment insert
CREATE OR REPLACE FUNCTION set_appointment_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL THEN
    NEW.confirmation_code = generate_confirmation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update availability booking count
CREATE OR REPLACE FUNCTION update_availability_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase booking count
    UPDATE appointment_availability
    SET current_bookings = current_bookings + 1
    WHERE provider_id = NEW.provider_id
      AND date = NEW.preferred_date
      AND start_time <= NEW.preferred_time
      AND end_time >= (NEW.preferred_time + (COALESCE(NEW.duration_minutes, 60) || ' minutes')::INTERVAL)::TIME;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease booking count
    UPDATE appointment_availability
    SET current_bookings = current_bookings - 1
    WHERE provider_id = OLD.provider_id
      AND date = OLD.preferred_date
      AND start_time <= OLD.preferred_time
      AND end_time >= (OLD.preferred_time + (COALESCE(OLD.duration_minutes, 60) || ' minutes')::INTERVAL)::TIME;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes (cancelled appointments should free up slots)
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
      UPDATE appointment_availability
      SET current_bookings = current_bookings - 1
      WHERE provider_id = NEW.provider_id
        AND date = NEW.preferred_date
        AND start_time <= NEW.preferred_time
        AND end_time >= (NEW.preferred_time + (COALESCE(NEW.duration_minutes, 60) || ' minutes')::INTERVAL)::TIME;
    ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      UPDATE appointment_availability
      SET current_bookings = current_bookings + 1
      WHERE provider_id = NEW.provider_id
        AND date = NEW.preferred_date
        AND start_time <= NEW.preferred_time
        AND end_time >= (NEW.preferred_time + (COALESCE(NEW.duration_minutes, 60) || ' minutes')::INTERVAL)::TIME;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

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

-- ===============================================
-- STEP 9: CREATE TRIGGERS
-- ===============================================

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for appointment confirmation code
CREATE OR REPLACE TRIGGER trigger_set_appointment_confirmation_code
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_appointment_confirmation_code();

-- Trigger for availability booking count
CREATE OR REPLACE TRIGGER trigger_update_availability_booking_count
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_booking_count();

-- Add updated_at triggers for all tables
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_banners_updated_at BEFORE UPDATE ON event_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedure_categories_updated_at BEFORE UPDATE ON procedure_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_shorts_updated_at BEFORE UPDATE ON video_shorts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_features_updated_at BEFORE UPDATE ON clinic_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_selfie_reviews_updated_at BEFORE UPDATE ON selfie_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_youtube_videos_updated_at BEFORE UPDATE ON youtube_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_differentiators_updated_at BEFORE UPDATE ON differentiators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- STEP 10: SAMPLE DATA (Optional - remove in production)
-- ===============================================

-- Clean up any existing problematic data to avoid conflicts
DELETE FROM youtube_videos WHERE youtube_id IN ('dQw4w9WgXcQ', 'ABC123xyz456', 'DEF456uvw789', 'GHI789rst012');

-- Sample data insertion
INSERT INTO procedure_categories (name, description, display_order) VALUES
('Facial Procedures', 'Surgical and non-surgical facial enhancements', 1),
('Body Contouring', 'Body sculpting and contouring procedures', 2),
('Breast Surgery', 'Breast enhancement and reconstruction', 3),
('Reconstructive Surgery', 'Reconstructive and corrective procedures', 4),
('Non-Surgical Treatments', 'Minimally invasive cosmetic treatments', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO procedures (category_id, name, slug, description, duration_minutes, price_range) VALUES
(1, 'Facelift', 'facelift', 'Comprehensive facial rejuvenation procedure', 300, '$8,000 - $15,000'),
(1, 'Rhinoplasty', 'rhinoplasty', 'Nose reshaping surgery', 180, '$6,000 - $10,000'),
(2, 'Liposuction', 'liposuction', 'Fat removal and body contouring', 120, '$3,000 - $8,000'),
(3, 'Breast Augmentation', 'breast-augmentation', 'Breast size enhancement', 120, '$5,000 - $8,000'),
(5, 'Botox Injection', 'botox', 'Wrinkle reduction treatment', 30, '$300 - $800')
ON CONFLICT (slug) DO NOTHING;

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

INSERT INTO selfie_reviews (patient_name, patient_initial, procedure_type, procedure_id, selfie_url, review_text, rating, verified, featured, patient_age_range, treatment_date, recovery_weeks, consent_given, moderation_status, display_order) VALUES
('김**', '김**', '눈성형', 1, '/images/reviews/selfie1.jpg', '자연스럽고 만족스러운 결과입니다. 회복도 빨랐어요!', 5, true, true, '20대', '2024-01-15', 2, true, 'approved', 1),
('이**', '이**', '코성형', 2, '/images/reviews/selfie2.jpg', '원하던 라인으로 예쁘게 나왔어요. 추천합니다!', 5, true, true, '30대', '2024-02-10', 3, true, 'approved', 2),
('박**', '박**', '안면윤곽', 1, '/images/reviews/selfie3.jpg', '전문적이고 세심한 상담과 시술에 감사드립니다.', 5, true, false, '20대', '2024-01-20', 4, true, 'approved', 3)
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'MASTER DATABASE SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'All tables, indexes, RLS policies, functions, and triggers have been created.';
  RAISE NOTICE 'Key fixes applied:';
  RAISE NOTICE '- selfie_reviews.procedure_id now has proper foreign key constraint to procedures(id)';
  RAISE NOTICE '- Contact form RLS policies completely fixed for anonymous and authenticated access';
  RAISE NOTICE '- All SQL files consolidated into single master file';
  RAISE NOTICE 'The database is ready for use!';
  RAISE NOTICE '===============================================';
END $$;
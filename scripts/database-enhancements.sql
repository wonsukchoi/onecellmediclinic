-- Enhanced Database Schema for OneCell Medical Clinic
-- Run these commands in your Supabase SQL Editor after running database-setup.sql

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

-- Create enhanced appointments table (keeping existing, adding new columns)
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

-- Create indexes for performance
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

-- Enable Row Level Security for new tables
ALTER TABLE procedure_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables

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

-- Functions for business logic

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

-- Trigger for appointment confirmation code
CREATE OR REPLACE TRIGGER trigger_set_appointment_confirmation_code
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_appointment_confirmation_code();

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

-- Trigger for availability booking count
CREATE OR REPLACE TRIGGER trigger_update_availability_booking_count
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_booking_count();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_procedure_categories_updated_at BEFORE UPDATE ON procedure_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion (optional - remove in production)
INSERT INTO procedure_categories (name, description, display_order) VALUES
('Facial Procedures', 'Surgical and non-surgical facial enhancements', 1),
('Body Contouring', 'Body sculpting and contouring procedures', 2),
('Breast Surgery', 'Breast enhancement and reconstruction', 3),
('Reconstructive Surgery', 'Reconstructive and corrective procedures', 4),
('Non-Surgical Treatments', 'Minimally invasive cosmetic treatments', 5);

INSERT INTO procedures (category_id, name, slug, description, duration_minutes, price_range) VALUES
(1, 'Facelift', 'facelift', 'Comprehensive facial rejuvenation procedure', 300, '$8,000 - $15,000'),
(1, 'Rhinoplasty', 'rhinoplasty', 'Nose reshaping surgery', 180, '$6,000 - $10,000'),
(2, 'Liposuction', 'liposuction', 'Fat removal and body contouring', 120, '$3,000 - $8,000'),
(3, 'Breast Augmentation', 'breast-augmentation', 'Breast size enhancement', 120, '$5,000 - $8,000'),
(5, 'Botox Injection', 'botox', 'Wrinkle reduction treatment', 30, '$300 - $800');

-- Insert default provider availability (9 AM to 5 PM, weekdays)
-- This would typically be done through an admin interface
-- INSERT INTO appointment_availability (provider_id, date, start_time, end_time, slot_duration_minutes)
-- SELECT 1, date_trunc('day', NOW() + interval '1 day' * generate_series(1, 30)) as date, '09:00:00'::TIME, '17:00:00'::TIME, 60
-- WHERE EXTRACT(DOW FROM date_trunc('day', NOW() + interval '1 day' * generate_series(1, 30))) BETWEEN 1 AND 5;
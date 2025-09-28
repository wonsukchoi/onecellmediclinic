-- Member System Database Schema
-- Tables for comprehensive member management system

-- Create enum types for member system
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE membership_type AS ENUM ('basic', 'premium', 'vip');
CREATE TYPE visit_type AS ENUM ('consultation', 'procedure', 'follow_up', 'emergency');
CREATE TYPE record_status AS ENUM ('completed', 'in_progress', 'cancelled');
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('card', 'cash', 'insurance', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE consultation_type AS ENUM ('online', 'in_person', 'phone');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE note_status AS ENUM ('draft', 'completed', 'reviewed');

-- Member Profiles table (extends the basic user system)
CREATE TABLE IF NOT EXISTS member_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender gender_type,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    insurance_provider TEXT,
    insurance_number TEXT,
    profile_image_url TEXT,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    membership_type membership_type DEFAULT 'basic',
    member_since TIMESTAMPTZ DEFAULT NOW(),
    last_visit TIMESTAMPTZ,
    total_visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id),
    visit_date TIMESTAMPTZ NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    prescribed_medications TEXT,
    follow_up_date DATE,
    visit_type visit_type DEFAULT 'consultation',
    status record_status DEFAULT 'completed',
    attachments TEXT[], -- Array of file URLs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) NOT NULL,
    medical_record_id UUID REFERENCES medical_records(id),
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    quantity INTEGER NOT NULL,
    refills_remaining INTEGER DEFAULT 0,
    prescribed_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date DATE,
    status prescription_status DEFAULT 'active',
    pharmacy_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment History table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id),
    medical_record_id UUID REFERENCES medical_records(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KRW',
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    description TEXT NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    receipt_url TEXT,
    insurance_claimed BOOLEAN DEFAULT false,
    insurance_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation Notes table
CREATE TABLE IF NOT EXISTS consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id),
    consultation_type consultation_type DEFAULT 'in_person',
    chief_complaint TEXT NOT NULL,
    symptoms TEXT,
    examination_findings TEXT,
    assessment TEXT NOT NULL,
    recommendations TEXT,
    follow_up_instructions TEXT,
    priority_level priority_level DEFAULT 'medium',
    attachments TEXT[], -- Array of file URLs
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    duration_minutes INTEGER,
    status note_status DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Notifications table
CREATE TABLE IF NOT EXISTS member_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, reminder, appointment
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Sessions table (for tracking login history)
CREATE TABLE IF NOT EXISTS member_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
    session_token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_profiles_email ON member_profiles(email);
CREATE INDEX IF NOT EXISTS idx_member_profiles_phone ON member_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_member_profiles_membership_type ON member_profiles(membership_type);

CREATE INDEX IF NOT EXISTS idx_medical_records_member_id ON medical_records(member_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_provider_id ON medical_records(provider_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);

CREATE INDEX IF NOT EXISTS idx_prescriptions_member_id ON prescriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_provider_id ON prescriptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescribed_date ON prescriptions(prescribed_date DESC);

CREATE INDEX IF NOT EXISTS idx_payment_history_member_id ON payment_history(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(payment_status);

CREATE INDEX IF NOT EXISTS idx_consultation_notes_member_id ON consultation_notes(member_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_provider_id ON consultation_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_consultation_date ON consultation_notes(consultation_date DESC);

CREATE INDEX IF NOT EXISTS idx_member_notifications_member_id ON member_notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_member_notifications_read_at ON member_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_member_notifications_created_at ON member_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_sessions_member_id ON member_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_sessions_is_active ON member_sessions(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_member_profiles_updated_at
    BEFORE UPDATE ON member_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_notes_updated_at
    BEFORE UPDATE ON consultation_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update total_visits when medical records are added
CREATE OR REPLACE FUNCTION update_member_visit_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE member_profiles
        SET total_visits = total_visits + 1,
            last_visit = NEW.visit_date
        WHERE id = NEW.member_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE member_profiles
        SET total_visits = GREATEST(total_visits - 1, 0)
        WHERE id = OLD.member_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_member_visit_count_trigger
    AFTER INSERT OR DELETE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_member_visit_count();

-- RLS Policies
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_sessions ENABLE ROW LEVEL SECURITY;

-- Member profiles policies
CREATE POLICY "Members can view own profile" ON member_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Members can update own profile" ON member_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Members can insert own profile" ON member_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers and admins can view member profiles
CREATE POLICY "Providers can view member profiles" ON member_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.email = 'admin@onecellclinic.com' OR u.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Medical records policies
CREATE POLICY "Members can view own medical records" ON medical_records
    FOR SELECT USING (member_id = auth.uid());

-- Providers can view and manage medical records for their patients
CREATE POLICY "Providers can manage medical records" ON medical_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.user_id = auth.uid()
            AND p.id = medical_records.provider_id
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.email = 'admin@onecellclinic.com' OR u.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Prescriptions policies
CREATE POLICY "Members can view own prescriptions" ON prescriptions
    FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Providers can manage prescriptions" ON prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.user_id = auth.uid()
            AND p.id = prescriptions.provider_id
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.email = 'admin@onecellclinic.com' OR u.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Payment history policies
CREATE POLICY "Members can view own payment history" ON payment_history
    FOR SELECT USING (member_id = auth.uid());

-- Staff can view and manage payment records
CREATE POLICY "Staff can manage payment history" ON payment_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.email = 'admin@onecellclinic.com' OR u.raw_user_meta_data->>'role' IN ('admin', 'staff'))
        )
    );

-- Consultation notes policies
CREATE POLICY "Members can view own consultation notes" ON consultation_notes
    FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Providers can manage consultation notes" ON consultation_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.user_id = auth.uid()
            AND p.id = consultation_notes.provider_id
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.email = 'admin@onecellclinic.com' OR u.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Member notifications policies
CREATE POLICY "Members can view own notifications" ON member_notifications
    FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Members can update own notifications" ON member_notifications
    FOR UPDATE USING (member_id = auth.uid());

-- Staff can create notifications for members
CREATE POLICY "Staff can create member notifications" ON member_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.email = 'admin@onecellclinic.com' OR u.raw_user_meta_data->>'role' IN ('admin', 'staff'))
        )
    );

-- Member sessions policies
CREATE POLICY "Members can view own sessions" ON member_sessions
    FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Members can insert own sessions" ON member_sessions
    FOR INSERT WITH CHECK (member_id = auth.uid());

-- Create function to get member dashboard data
CREATE OR REPLACE FUNCTION get_member_dashboard_data(member_uuid UUID)
RETURNS TABLE(
    profile JSONB,
    upcoming_appointments JSONB,
    recent_medical_records JSONB,
    active_prescriptions JSONB,
    recent_payments JSONB,
    unread_notifications INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        row_to_json(mp.*)::jsonb as profile,
        COALESCE(
            (
                SELECT jsonb_agg(row_to_json(a.*) ORDER BY a.preferred_date)
                FROM appointments a
                JOIN member_profiles mp2 ON mp2.email = a.patient_email
                WHERE mp2.id = member_uuid
                AND a.preferred_date >= CURRENT_DATE
                LIMIT 5
            ),
            '[]'::jsonb
        ) as upcoming_appointments,
        COALESCE(
            (
                SELECT jsonb_agg(
                    row_to_json(mr.*) ||
                    jsonb_build_object('provider', row_to_json(p.*))
                    ORDER BY mr.visit_date DESC
                )
                FROM medical_records mr
                LEFT JOIN providers p ON p.id = mr.provider_id
                WHERE mr.member_id = member_uuid
                LIMIT 5
            ),
            '[]'::jsonb
        ) as recent_medical_records,
        COALESCE(
            (
                SELECT jsonb_agg(
                    row_to_json(pr.*) ||
                    jsonb_build_object('provider', row_to_json(p.*))
                    ORDER BY pr.prescribed_date DESC
                )
                FROM prescriptions pr
                LEFT JOIN providers p ON p.id = pr.provider_id
                WHERE pr.member_id = member_uuid
                AND pr.status = 'active'
                LIMIT 5
            ),
            '[]'::jsonb
        ) as active_prescriptions,
        COALESCE(
            (
                SELECT jsonb_agg(row_to_json(ph.*) ORDER BY ph.payment_date DESC)
                FROM payment_history ph
                WHERE ph.member_id = member_uuid
                LIMIT 5
            ),
            '[]'::jsonb
        ) as recent_payments,
        COALESCE(
            (
                SELECT COUNT(*)::INTEGER
                FROM member_notifications mn
                WHERE mn.member_id = member_uuid
                AND mn.read_at IS NULL
            ),
            0
        ) as unread_notifications
    FROM member_profiles mp
    WHERE mp.id = member_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_member_dashboard_data(UUID) TO authenticated;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID, member_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE member_notifications
    SET read_at = NOW()
    WHERE id = notification_id
    AND member_id = member_uuid
    AND read_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID, UUID) TO authenticated;

-- Create function to send member notification
CREATE OR REPLACE FUNCTION send_member_notification(
    member_uuid UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'info',
    action_url TEXT DEFAULT NULL,
    metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO member_notifications (
        member_id,
        title,
        message,
        type,
        action_url,
        metadata
    ) VALUES (
        member_uuid,
        notification_title,
        notification_message,
        notification_type,
        action_url,
        metadata
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_member_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

COMMIT;
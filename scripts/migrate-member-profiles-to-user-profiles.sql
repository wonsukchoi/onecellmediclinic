-- Migration: Consolidate member_profiles into user_profiles
-- TASK_ID: MIGRATE-MEMBER-PROFILES-001

-- Step 1: Ensure user_profiles has all necessary fields that member_profiles had
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS membership_type VARCHAR(20) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS member_since TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0;

-- Step 2: Migrate any existing data from member_profiles to user_profiles
-- (Only if there's data in member_profiles that isn't in user_profiles)
INSERT INTO user_profiles (
    id,
    full_name,
    phone,
    date_of_birth,
    gender,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    medical_history,
    allergies,
    current_medications,
    insurance_provider,
    insurance_number,
    profile_image_url,
    email_verified,
    phone_verified,
    membership_type,
    member_since,
    last_visit,
    total_visits,
    role,
    created_at,
    updated_at
)
SELECT
    mp.id,
    mp.name,
    mp.phone,
    mp.date_of_birth,
    CASE
        WHEN mp.gender = 'male' THEN 'male'
        WHEN mp.gender = 'female' THEN 'female'
        ELSE 'other'
    END,
    mp.address,
    mp.emergency_contact_name,
    mp.emergency_contact_phone,
    mp.medical_history,
    mp.allergies,
    mp.current_medications,
    mp.insurance_provider,
    mp.insurance_number,
    mp.profile_image_url,
    mp.email_verified,
    mp.phone_verified,
    mp.membership_type,
    mp.member_since,
    mp.last_visit,
    mp.total_visits,
    'patient', -- Set role to 'patient' for all migrated member profiles
    mp.created_at,
    mp.updated_at
FROM member_profiles mp
WHERE mp.id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    address = EXCLUDED.address,
    emergency_contact_name = EXCLUDED.emergency_contact_name,
    emergency_contact_phone = EXCLUDED.emergency_contact_phone,
    medical_history = EXCLUDED.medical_history,
    allergies = EXCLUDED.allergies,
    current_medications = EXCLUDED.current_medications,
    insurance_provider = EXCLUDED.insurance_provider,
    insurance_number = EXCLUDED.insurance_number,
    profile_image_url = EXCLUDED.profile_image_url,
    email_verified = EXCLUDED.email_verified,
    phone_verified = EXCLUDED.phone_verified,
    membership_type = EXCLUDED.membership_type,
    member_since = EXCLUDED.member_since,
    last_visit = EXCLUDED.last_visit,
    total_visits = EXCLUDED.total_visits,
    role = COALESCE(user_profiles.role, 'patient'),
    updated_at = EXCLUDED.updated_at;

-- Step 3: Update foreign key constraints to point to user_profiles

-- Update medical_records table
ALTER TABLE medical_records
DROP CONSTRAINT IF EXISTS medical_records_member_id_fkey;

ALTER TABLE medical_records
ADD CONSTRAINT medical_records_member_id_fkey
FOREIGN KEY (member_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update prescriptions table
ALTER TABLE prescriptions
DROP CONSTRAINT IF EXISTS prescriptions_member_id_fkey;

ALTER TABLE prescriptions
ADD CONSTRAINT prescriptions_member_id_fkey
FOREIGN KEY (member_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update payment_history table
ALTER TABLE payment_history
DROP CONSTRAINT IF EXISTS payment_history_member_id_fkey;

ALTER TABLE payment_history
ADD CONSTRAINT payment_history_member_id_fkey
FOREIGN KEY (member_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update consultation_notes table
ALTER TABLE consultation_notes
DROP CONSTRAINT IF EXISTS consultation_notes_member_id_fkey;

ALTER TABLE consultation_notes
ADD CONSTRAINT consultation_notes_member_id_fkey
FOREIGN KEY (member_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update member_notifications table
ALTER TABLE member_notifications
DROP CONSTRAINT IF EXISTS member_notifications_member_id_fkey;

ALTER TABLE member_notifications
ADD CONSTRAINT member_notifications_member_id_fkey
FOREIGN KEY (member_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update member_sessions table (if it exists)
ALTER TABLE member_sessions
DROP CONSTRAINT IF EXISTS member_sessions_member_id_fkey;

ALTER TABLE member_sessions
ADD CONSTRAINT member_sessions_member_id_fkey
FOREIGN KEY (member_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Step 4: Update any indexes that referenced member_profiles
-- (Add indexes for commonly queried fields on user_profiles)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_membership_type ON user_profiles(membership_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);

-- Step 5: Drop the member_profiles table
DROP TABLE IF EXISTS member_profiles CASCADE;

-- Step 6: Update any triggers or functions that referenced member_profiles
-- (This is a placeholder - adjust based on your specific triggers/functions)

-- Migration completed
COMMENT ON TABLE user_profiles IS 'Unified user profiles table - migrated from member_profiles';
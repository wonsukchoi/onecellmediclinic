-- Fix Row Level Security (RLS) Policy for contact_submissions table
-- This script resolves the "new row violates row-level security policy" error
-- Run this in your Supabase SQL Editor

-- First, drop any existing conflicting policies for contact_submissions
DROP POLICY IF EXISTS "Allow public contact form submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;

-- Ensure RLS is enabled on the table
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create a comprehensive policy that allows anonymous users to INSERT contact submissions
-- This policy allows any user (authenticated or anonymous) to submit contact forms
CREATE POLICY "Enable public contact form submissions" ON contact_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy for authenticated users to view contact submissions
-- This restricts READ access to authenticated users only (for admin purposes)
CREATE POLICY "Enable authenticated users to view contact submissions" ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy for authenticated users to update contact submissions (admin functionality)
CREATE POLICY "Enable authenticated users to update contact submissions" ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a policy for authenticated users to delete contact submissions (admin functionality)
CREATE POLICY "Enable authenticated users to delete contact submissions" ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY policyname;

-- Test the INSERT policy works for anonymous users
-- This should succeed without authentication
-- INSERT INTO contact_submissions (name, email, phone, service_type, message, preferred_contact, status)
-- VALUES ('Test User', 'test@example.com', '123-456-7890', 'consultation', 'Test message', 'email', 'new');

-- Grant necessary permissions to public role for INSERT operations
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON contact_submissions TO authenticated;

-- Grant usage on the sequence for auto-incrementing ID
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO anon;
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO authenticated;

-- Ensure the table structure allows for proper defaults
-- Remove any NOT NULL constraints that might cause issues with auto-generated fields
ALTER TABLE contact_submissions ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE contact_submissions ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE contact_submissions ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE contact_submissions ALTER COLUMN preferred_contact SET DEFAULT 'email';

-- Update the trigger function to ensure it can be executed by anonymous users
-- The update_updated_at_column function should be SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it works with the SECURITY DEFINER function
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Test that anonymous role can insert (this should work now)
-- SET ROLE anon;
-- INSERT INTO contact_submissions (name, email, message) VALUES ('Test', 'test@test.com', 'Test message');
-- RESET ROLE;

COMMENT ON POLICY "Enable public contact form submissions" ON contact_submissions IS
'Allows anonymous and authenticated users to submit contact forms. This is necessary for public contact form functionality.';

COMMENT ON POLICY "Enable authenticated users to view contact submissions" ON contact_submissions IS
'Restricts viewing contact submissions to authenticated users only for security and privacy.';
-- FINAL FIX: Contact Submissions RLS and Permissions
-- This script completely resolves the contact_submissions table access issues
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "Allow public contact form submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated users to view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable public contact form submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable authenticated users to view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable authenticated users to update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable authenticated users to delete contact submissions" ON contact_submissions;

-- Step 2: Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Grant necessary table permissions to anonymous users
GRANT INSERT ON contact_submissions TO anon;
GRANT INSERT ON contact_submissions TO authenticated;

-- Step 4: Grant sequence permissions for auto-incrementing ID
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO authenticated;

-- Step 5: Ensure the trigger function has proper security context
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create a single, comprehensive INSERT policy for anonymous users
CREATE POLICY "anonymous_insert_contact_submissions" ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 8: Create INSERT policy for authenticated users
CREATE POLICY "authenticated_insert_contact_submissions" ON contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 9: Create SELECT policy for authenticated users (admin access)
CREATE POLICY "authenticated_select_contact_submissions" ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 10: Create UPDATE policy for authenticated users (admin access)
CREATE POLICY "authenticated_update_contact_submissions" ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 11: Create DELETE policy for authenticated users (admin access)
CREATE POLICY "authenticated_delete_contact_submissions" ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 12: Ensure proper column defaults
ALTER TABLE contact_submissions
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN status SET DEFAULT 'new',
  ALTER COLUMN preferred_contact SET DEFAULT 'email';

-- Step 13: Test the setup with a direct insert
-- This should work without any authentication
SET ROLE anon;
INSERT INTO contact_submissions (name, email, phone, service_type, message, preferred_contact)
VALUES ('Test User', 'test@example.com', '123-456-7890', 'dermatology', 'Test message from anon role', 'email');
RESET ROLE;

-- Step 14: Verify the policies are correctly applied
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY policyname;

-- Step 15: Verify permissions are granted
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_name = 'contact_submissions'
  AND grantee IN ('anon', 'authenticated', 'public');

-- Step 16: Verify sequence permissions
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.usage_privileges
WHERE object_name = 'contact_submissions_id_seq'
  AND grantee IN ('anon', 'authenticated', 'public');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Contact submissions table RLS policies and permissions have been successfully configured!';
  RAISE NOTICE 'Anonymous users can now insert contact form submissions.';
  RAISE NOTICE 'Authenticated users have full CRUD access for administrative purposes.';
END $$;
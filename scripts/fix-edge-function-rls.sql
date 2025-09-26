-- Fix RLS policies for contact_submissions table to allow edge function access
-- This script ensures the edge function can properly insert contact form submissions

-- First, check the current policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'contact_submissions';

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable select for admin users" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public insert" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anon inserts" ON contact_submissions;

-- Create comprehensive RLS policies for the contact_submissions table
-- 1. Allow anonymous users (edge functions) to insert
CREATE POLICY "Allow anonymous insert" ON contact_submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 2. Allow service role (edge functions with service key) to do everything
CREATE POLICY "Service role full access" ON contact_submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Allow authenticated users to view their own submissions
CREATE POLICY "Users view own submissions" ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- 4. Allow public/anon to select recent submissions for rate limiting
CREATE POLICY "Allow anon select for rate limit" ON contact_submissions
    FOR SELECT
    TO anon
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT INSERT, SELECT ON contact_submissions TO anon;
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO anon;

-- Test the configuration
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for contact_submissions have been updated.';
    RAISE NOTICE 'Edge functions should now be able to insert and select for rate limiting.';
END $$;

-- Verify the policies
SELECT
    'After Update' as status,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY policyname;
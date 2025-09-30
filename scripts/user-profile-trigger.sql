-- ============================================
-- USER PROFILE TRIGGER MIGRATION
-- ============================================
-- This migration creates comprehensive triggers for automatic user profile
-- creation and updates when users register or update their auth metadata.
--
-- Features:
-- - Automatically creates user profiles on signup
-- - Updates profiles when auth metadata changes
-- - Handles all metadata fields: name, phone, date_of_birth, gender, role, membership_type
-- - Includes proper error handling and logging
-- - Idempotent design (can be run multiple times safely)
--
-- Based on Supabase documentation:
-- https://supabase.com/docs/guides/auth/managing-user-data
-- ============================================

-- Drop existing trigger and function if they exist (for idempotent migrations)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();

-- ============================================
-- FUNCTION: Handle New User Registration
-- ============================================
-- This function creates a user profile automatically when a new user signs up
-- It extracts metadata from auth.users.raw_user_meta_data and populates user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_exists BOOLEAN := FALSE;
BEGIN
  -- Log the new user creation attempt
  RAISE LOG 'Creating user profile for user ID: %', NEW.id;

  -- Check if profile already exists (safety check)
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE id = NEW.id
  ) INTO profile_exists;

  -- Only create profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.user_profiles (
      id,
      full_name,
      phone,
      date_of_birth,
      gender,
      role,
      membership_type
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.raw_user_meta_data->>'phone',
      CASE
        WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL
        THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
        ELSE NULL
      END,
      NEW.raw_user_meta_data->>'gender',
      COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
      CASE
        WHEN NEW.raw_user_meta_data->>'membership_type' IN ('basic', 'premium', 'vip')
        THEN (NEW.raw_user_meta_data->>'membership_type')::membership_type
        ELSE 'basic'::membership_type
      END
    );

    RAISE LOG 'Successfully created user profile for user ID: %', NEW.id;
  ELSE
    RAISE LOG 'User profile already exists for user ID: %', NEW.id;
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error creating user profile for user ID %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Handle User Metadata Updates
-- ============================================
-- This function updates the user profile when auth metadata changes
-- It syncs changes from auth.users.raw_user_meta_data to user_profiles
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  profile_exists BOOLEAN := FALSE;
BEGIN
  -- Log the user update attempt
  RAISE LOG 'Updating user profile for user ID: %', NEW.id;

  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE id = NEW.id
  ) INTO profile_exists;

  -- Only update if profile exists and metadata has changed
  IF profile_exists AND (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data) THEN
    UPDATE public.user_profiles SET
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      phone = NEW.raw_user_meta_data->>'phone',
      date_of_birth = CASE
        WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL
        THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
        ELSE NULL
      END,
      gender = NEW.raw_user_meta_data->>'gender',
      role = COALESCE(NEW.raw_user_meta_data->>'role', role), -- Keep existing role if not provided
      membership_type = CASE
        WHEN NEW.raw_user_meta_data->>'membership_type' IN ('basic', 'premium', 'vip')
        THEN (NEW.raw_user_meta_data->>'membership_type')::membership_type
        ELSE membership_type -- Keep existing membership_type if not provided or invalid
      END,
      updated_at = NOW()
    WHERE id = NEW.id;

    RAISE LOG 'Successfully updated user profile for user ID: %', NEW.id;
  ELSIF NOT profile_exists THEN
    -- If profile doesn't exist, create it
    RAISE LOG 'Profile does not exist for user ID: %, creating new profile', NEW.id;
    PERFORM public.handle_new_user();
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user update
    RAISE LOG 'Error updating user profile for user ID %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS: Automatic Profile Management
-- ============================================

-- Trigger for new user registration
-- Fires after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for user metadata updates
-- Fires after user metadata is updated in auth.users
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Ensure the functions can be executed by the service role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify the triggers are working:

-- 1. Check if triggers exist:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- AND trigger_name IN ('on_auth_user_created', 'on_auth_user_updated');

-- 2. Check if functions exist:
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('handle_new_user', 'handle_user_update');

-- 3. Test profile creation by checking existing users:
-- SELECT u.id, u.email, u.raw_user_meta_data, up.full_name, up.phone, up.role
-- FROM auth.users u
-- LEFT JOIN public.user_profiles up ON u.id = up.id
-- LIMIT 5;

-- ============================================
-- NOTES
-- ============================================
-- 1. The triggers use SECURITY DEFINER to ensure proper permissions
-- 2. Error handling prevents auth failures if profile operations fail
-- 3. The functions are idempotent and can handle existing profiles
-- 4. Metadata fields are mapped as follows:
--    - full_name: raw_user_meta_data->>'full_name' or 'name'
--    - phone: raw_user_meta_data->>'phone'
--    - date_of_birth: raw_user_meta_data->>'date_of_birth' (converted to DATE)
--    - gender: raw_user_meta_data->>'gender'
--    - role: raw_user_meta_data->>'role' (defaults to 'patient')
--    - membership_type: raw_user_meta_data->>'membership_type' (validated against enum, defaults to 'basic')
-- 5. The membership_type field is included and validated against enum values ('basic', 'premium', 'vip')
-- 6. Address, emergency contacts, and medical history are not synced from auth metadata
--    as they should be collected separately through the application
-- ============================================

RAISE NOTICE 'User profile trigger migration completed successfully!';
RAISE NOTICE 'Triggers created: on_auth_user_created, on_auth_user_updated';
RAISE NOTICE 'Functions created: handle_new_user(), handle_user_update()';
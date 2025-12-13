-- Migration: Fix user creation triggers
-- Description: Consolidates handle_new_user and handle_new_user_organization into a single atomic trigger
-- to prevent race conditions and ensure proper execution order

-- Drop existing triggers (they fire on same event, order is implicit)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;

-- Drop old functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_user_organization();

-- Create consolidated function that handles both profile and organization creation
CREATE OR REPLACE FUNCTION handle_new_user_complete()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Step 1: Create user profile
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  -- Step 2: Create personal organization
  INSERT INTO public.organizations (name, slug, is_personal, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.id::TEXT, -- use user_id as slug to guarantee uniqueness
    true,
    NEW.id
  )
  RETURNING id INTO org_id;

  -- Step 3: Add user as owner of their organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');

  -- Step 4: Set as current organization (profile exists from step 1)
  UPDATE public.profiles
  SET current_organization_id = org_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create single trigger for user creation
CREATE TRIGGER on_auth_user_created_complete
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_complete();

-- Add comment
COMMENT ON FUNCTION handle_new_user_complete() IS 'Creates profile, personal organization, and membership atomically on user signup';

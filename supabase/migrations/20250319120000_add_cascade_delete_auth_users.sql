-- Add cascade delete functionality to properly clean up auth.users when profiles are deleted
-- This fixes the issue where deleting profiles leaves orphaned auth.users records

-- Create a function to delete auth user when profile is deleted
CREATE OR REPLACE FUNCTION delete_auth_user_on_profile_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the corresponding auth.users record
  -- This requires service role permissions
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the profile deletion
    RAISE WARNING 'Failed to delete auth.users record for profile %: %', OLD.id, SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-delete auth users when profiles are deleted
DROP TRIGGER IF EXISTS delete_auth_user_trigger ON public.profiles;
CREATE TRIGGER delete_auth_user_trigger
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_profile_delete();

-- Create a function to manually clean up orphaned auth users
-- (Users in auth.users that don't have corresponding profiles)
CREATE OR REPLACE FUNCTION clean_orphaned_auth_users()
RETURNS TABLE (
  deleted_user_id uuid,
  email text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  DELETE FROM auth.users 
  WHERE id NOT IN (SELECT id FROM public.profiles)
    AND id NOT IN (
      -- Exclude recently created users (within last hour) to avoid deleting users mid-signup
      SELECT id FROM auth.users WHERE created_at > NOW() - INTERVAL '1 hour'
    )
  RETURNING id, email, created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION clean_orphaned_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION clean_orphaned_auth_users() TO service_role;
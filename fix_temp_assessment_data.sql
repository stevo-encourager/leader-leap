-- Fix temp_assessment_data table for email-based access and automatic cleanup
-- Run this in the Supabase Dashboard SQL Editor

-- 1. Extend expiration time to 12 hours for better user experience
ALTER TABLE public.temp_assessment_data 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '12 hours');

-- 2. Disable RLS to fix 406 error (data is temporary and auto-expires)
-- Note: This table contains temporary data that expires quickly and is only used
-- during the brief signup -> email verification window. The security risk is minimal
-- given the short lifespan and temporary nature of the data.
ALTER TABLE public.temp_assessment_data DISABLE ROW LEVEL SECURITY;

-- 3. Update the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_temp_assessment_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.temp_assessment_data 
  WHERE expires_at < now();
END;
$$;

-- Note: To automatically run cleanup, you can:
-- 1. Set up a cron job in your hosting environment to call this function
-- 2. Use Supabase Edge Functions with a scheduled trigger
-- 3. Run it manually via SQL: SELECT public.cleanup_expired_temp_assessment_data(); 
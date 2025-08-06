-- Fix temp_assessment_data table to expire after 2 hours instead of 1 hour
-- Run this in the Supabase Dashboard SQL Editor

-- 1. Update the default expiration time to 2 hours
ALTER TABLE public.temp_assessment_data 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '2 hours');

-- 2. Create a scheduled job to run cleanup every hour
-- Note: This requires pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, you'll need to run cleanup manually or set up a cron job

-- 3. Run cleanup manually to remove any existing expired records
SELECT public.cleanup_expired_temp_assessment_data();

-- 4. Verify the change by checking a few records
SELECT 
  id, 
  created_at, 
  expires_at, 
  expires_at - created_at as duration
FROM public.temp_assessment_data 
ORDER BY created_at DESC 
LIMIT 5; 
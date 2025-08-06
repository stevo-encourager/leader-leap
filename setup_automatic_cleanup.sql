-- Setup automatic cleanup for temp_assessment_data
-- Run this in the Supabase Dashboard SQL Editor

-- 1. First, let's check if pg_cron is available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        RAISE NOTICE 'pg_cron is available - setting up automatic cleanup';
        
        -- Schedule cleanup to run every hour
        PERFORM cron.schedule('cleanup-temp-assessment-data', '0 * * * *', 'SELECT public.cleanup_expired_temp_assessment_data();');
        
        RAISE NOTICE 'Automatic cleanup scheduled to run every hour';
    ELSE
        RAISE NOTICE 'pg_cron is not available - you will need to run cleanup manually';
        RAISE NOTICE 'To enable pg_cron, contact Supabase support or upgrade to a plan that supports it';
    END IF;
END $$;

-- 2. Update the default expiration time to 2 hours (if not already done)
ALTER TABLE public.temp_assessment_data 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '2 hours');

-- 3. Clean up any existing expired records
SELECT public.cleanup_expired_temp_assessment_data();

-- 4. Show current status
SELECT 
    'Current temp_assessment_data status:' as info,
    COUNT(*) as total_records,
    COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_records,
    COUNT(CASE WHEN expires_at >= now() THEN 1 END) as active_records
FROM public.temp_assessment_data;

-- 5. Show sample of recent records with their expiration times
SELECT 
    id, 
    created_at, 
    expires_at, 
    expires_at - created_at as duration,
    CASE 
        WHEN expires_at < now() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status
FROM public.temp_assessment_data 
ORDER BY created_at DESC 
LIMIT 10; 
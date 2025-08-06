-- Robust cleanup solution for temp_assessment_data
-- This combines trigger-based cleanup with a manual cleanup mechanism
-- Run this in the Supabase Dashboard SQL Editor

-- 1. First, let's create a more comprehensive cleanup function
CREATE OR REPLACE FUNCTION public.comprehensive_temp_data_cleanup()
RETURNS TABLE(
    total_records_before INTEGER,
    expired_records_removed INTEGER,
    total_records_after INTEGER,
    cleanup_timestamp TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    total_before INTEGER;
    expired_count INTEGER;
    total_after INTEGER;
BEGIN
    -- Count records before cleanup
    SELECT COUNT(*) INTO total_before FROM public.temp_assessment_data;
    
    -- Count expired records
    SELECT COUNT(*) INTO expired_count 
    FROM public.temp_assessment_data 
    WHERE expires_at < now();
    
    -- Remove expired records
    DELETE FROM public.temp_assessment_data 
    WHERE expires_at < now();
    
    -- Count records after cleanup
    SELECT COUNT(*) INTO total_after FROM public.temp_assessment_data;
    
    -- Return results
    RETURN QUERY SELECT 
        total_before,
        expired_count,
        total_after,
        now();
END;
$$;

-- 2. Create the trigger function (same as before, but calls the comprehensive function)
CREATE OR REPLACE FUNCTION public.trigger_cleanup_expired_temp_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Clean up expired records whenever new data is inserted
    DELETE FROM public.temp_assessment_data 
    WHERE expires_at < now();
    
    RETURN NEW;
END;
$$;

-- 3. Create the triggers
DROP TRIGGER IF EXISTS cleanup_expired_temp_data_trigger ON public.temp_assessment_data;
CREATE TRIGGER cleanup_expired_temp_data_trigger
    AFTER INSERT ON public.temp_assessment_data
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_cleanup_expired_temp_data();

DROP TRIGGER IF EXISTS cleanup_expired_temp_data_update_trigger ON public.temp_assessment_data;
CREATE TRIGGER cleanup_expired_temp_data_update_trigger
    AFTER UPDATE ON public.temp_assessment_data
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_cleanup_expired_temp_data();

-- 4. Create a function to check if cleanup is needed
CREATE OR REPLACE FUNCTION public.check_cleanup_needed()
RETURNS TABLE(
    needs_cleanup BOOLEAN,
    expired_count INTEGER,
    oldest_expired_hours NUMERIC,
    recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    expired_count INTEGER;
    oldest_hours NUMERIC;
BEGIN
    -- Count expired records
    SELECT COUNT(*) INTO expired_count 
    FROM public.temp_assessment_data 
    WHERE expires_at < now();
    
    -- Find oldest expired record (in hours)
    SELECT COALESCE(
        ROUND(EXTRACT(EPOCH FROM (now() - MIN(expires_at)))/3600, 1), 
        0
    ) INTO oldest_hours
    FROM public.temp_assessment_data 
    WHERE expires_at < now();
    
    -- Determine if cleanup is needed
    RETURN QUERY SELECT 
        expired_count > 0,
        expired_count,
        oldest_hours,
        CASE 
            WHEN expired_count = 0 THEN 'No cleanup needed'
            WHEN oldest_hours > 24 THEN 'URGENT: Records expired more than 24 hours ago'
            WHEN oldest_hours > 12 THEN 'HIGH: Records expired more than 12 hours ago'
            WHEN oldest_hours > 6 THEN 'MEDIUM: Records expired more than 6 hours ago'
            ELSE 'LOW: Records expired recently'
        END;
END;
$$;

-- 5. Run initial cleanup
SELECT * FROM public.comprehensive_temp_data_cleanup();

-- 6. Check current status
SELECT * FROM public.check_cleanup_needed();

-- 7. Show verification of triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'temp_assessment_data'; 
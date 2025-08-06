-- Alternative cleanup method using triggers (if pg_cron is not available)
-- This will clean up expired records whenever new data is inserted
-- Run this in the Supabase Dashboard SQL Editor

-- 1. Create a function that will be called by the trigger
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

-- 2. Create the trigger
DROP TRIGGER IF EXISTS cleanup_expired_temp_data_trigger ON public.temp_assessment_data;
CREATE TRIGGER cleanup_expired_temp_data_trigger
    AFTER INSERT ON public.temp_assessment_data
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_cleanup_expired_temp_data();

-- 3. Also create a trigger for updates (in case records are updated)
DROP TRIGGER IF EXISTS cleanup_expired_temp_data_update_trigger ON public.temp_assessment_data;
CREATE TRIGGER cleanup_expired_temp_data_update_trigger
    AFTER UPDATE ON public.temp_assessment_data
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_cleanup_expired_temp_data();

-- 4. Clean up any existing expired records
SELECT public.cleanup_expired_temp_assessment_data();

-- 5. Verify the triggers are created
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'temp_assessment_data'; 
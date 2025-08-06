-- Manual cleanup check for temp_assessment_data
-- Run this periodically to ensure expired records are removed

-- 1. Check current status
SELECT 
    'Current temp_assessment_data status:' as info,
    COUNT(*) as total_records,
    COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_records,
    COUNT(CASE WHEN expires_at >= now() THEN 1 END) as active_records;

-- 2. Show expired records (if any)
SELECT 
    id, 
    created_at, 
    expires_at, 
    expires_at - created_at as duration,
    ROUND(EXTRACT(EPOCH FROM (now() - expires_at))/3600, 1) as hours_expired
FROM public.temp_assessment_data 
WHERE expires_at < now()
ORDER BY expires_at DESC;

-- 3. Clean up expired records
SELECT public.cleanup_expired_temp_assessment_data();

-- 4. Show status after cleanup
SELECT 
    'After cleanup:' as info,
    COUNT(*) as total_records,
    COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_records,
    COUNT(CASE WHEN expires_at >= now() THEN 1 END) as active_records
FROM public.temp_assessment_data; 
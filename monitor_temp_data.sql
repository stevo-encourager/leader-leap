-- Monitor temp_assessment_data status
-- Run this periodically to check if cleanup is needed

-- Check if cleanup is needed
SELECT * FROM public.check_cleanup_needed();

-- If cleanup is needed, run it
-- (Uncomment the line below if you want to automatically run cleanup)
-- SELECT * FROM public.comprehensive_temp_data_cleanup();

-- Show current table status
SELECT 
    'Current temp_assessment_data status:' as info,
    COUNT(*) as total_records,
    COUNT(CASE WHEN expires_at < now() THEN 1 END) as expired_records,
    COUNT(CASE WHEN expires_at >= now() THEN 1 END) as active_records,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Table is empty'
        WHEN COUNT(CASE WHEN expires_at < now() THEN 1 END) = 0 THEN 'All records are active'
        ELSE 'Has expired records that need cleanup'
    END as status
FROM public.temp_assessment_data; 
-- Check RLS enablement
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'assessment_results');

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'assessment_results')
ORDER BY tablename, cmd;

-- Check if tables exist and have RLS
SELECT 
    table_name,
    row_security
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'assessment_results'); 
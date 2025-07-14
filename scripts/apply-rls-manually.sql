-- Manually apply RLS policies
-- Run this in your Supabase SQL Editor

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup and updates" ON public.profiles;

DROP POLICY IF EXISTS "Users can read their own assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Users can insert their own assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Users can update their own assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Users can delete their own assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Allow access to test assessment" ON public.assessment_results;

-- Create profiles policies
CREATE POLICY "Users can read their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  (auth.uid() = id) OR 
  (auth.uid() IS NULL AND id IS NOT NULL)
);

-- Create assessment_results policies
CREATE POLICY "Users can read their own assessment results" 
ON public.assessment_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment results" 
ON public.assessment_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment results" 
ON public.assessment_results 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessment results" 
ON public.assessment_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Special policy for test assessment
CREATE POLICY "Allow access to test assessment" 
ON public.assessment_results 
FOR ALL 
USING (id = '2631edf1-a358-4303-83c1-deb9664b53e2')
WITH CHECK (id = '2631edf1-a358-4303-83c1-deb9664b53e2');

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'assessment_results');

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'assessment_results')
ORDER BY tablename, cmd; 
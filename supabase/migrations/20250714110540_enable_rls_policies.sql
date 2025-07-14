-- Enable Row Level Security on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
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

-- Profiles table policies
-- Users can only read their own profile
CREATE POLICY "Users can read their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if the user is authenticated and inserting their own profile
  (auth.uid() = id) OR 
  -- Allow if this is being called by the handle_new_user function during signup
  (auth.uid() IS NULL AND id IS NOT NULL)
);

-- Assessment results table policies
-- Users can only read their own assessment results
CREATE POLICY "Users can read their own assessment results" 
ON public.assessment_results 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own assessment results
CREATE POLICY "Users can insert their own assessment results" 
ON public.assessment_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessment results
CREATE POLICY "Users can update their own assessment results" 
ON public.assessment_results 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own assessment results
CREATE POLICY "Users can delete their own assessment results" 
ON public.assessment_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Special policy for test assessment (allows access to specific test assessment)
CREATE POLICY "Allow access to test assessment" 
ON public.assessment_results 
FOR ALL 
USING (id = '2631edf1-a358-4303-83c1-deb9664b53e2')
WITH CHECK (id = '2631edf1-a358-4303-83c1-deb9664b53e2');

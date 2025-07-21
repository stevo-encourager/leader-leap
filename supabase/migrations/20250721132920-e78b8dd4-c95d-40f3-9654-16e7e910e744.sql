-- Fix RLS policies for assessment_results to properly allow anonymous inserts

-- Drop the conflicting INSERT policy that blocks anonymous users
DROP POLICY IF EXISTS "Users can insert their own assessment results" ON public.assessment_results;

-- Create a new INSERT policy that allows both authenticated users (with matching user_id) 
-- and anonymous users (with any user_id)
CREATE POLICY "Allow authenticated and anonymous assessment inserts" 
ON public.assessment_results 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and inserting their own assessment
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Allow if user is anonymous (auth.uid() is null) - for temporary assessments
  (auth.uid() IS NULL)
);
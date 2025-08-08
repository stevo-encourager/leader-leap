-- Fix the insecure INSERT policy on assessment_results table
-- Change from WITH CHECK (true) to WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL)
-- This allows authenticated users to insert their own data and anonymous users for temporary assessments

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessment_results;

-- Create the secure INSERT policy
CREATE POLICY "allow_all_inserts" 
ON public.assessment_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); 
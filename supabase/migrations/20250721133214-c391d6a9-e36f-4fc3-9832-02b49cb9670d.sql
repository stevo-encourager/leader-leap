-- Remove the conflicting INSERT policies and create a single comprehensive one
DROP POLICY IF EXISTS "Allow authenticated and anonymous assessment inserts" ON public.assessment_results;
DROP POLICY IF EXISTS "Allow service role and anon inserts" ON public.assessment_results;

-- Create a single INSERT policy that handles all cases properly
CREATE POLICY "Allow all assessment inserts for authenticated and anonymous users" 
ON public.assessment_results 
FOR INSERT 
WITH CHECK (
  -- Always allow inserts regardless of auth state
  -- This is needed for temporary assessments from anonymous users
  true
);
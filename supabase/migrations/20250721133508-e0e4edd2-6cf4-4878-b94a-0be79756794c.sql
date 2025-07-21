-- Force refresh of RLS policies by disabling and re-enabling RLS
ALTER TABLE public.assessment_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Ensure our policy is the only INSERT policy
DROP POLICY IF EXISTS "Allow all assessment inserts for authenticated and anonymous us" ON public.assessment_results;

-- Create the policy with a shorter name to avoid truncation
CREATE POLICY "allow_all_inserts" 
ON public.assessment_results 
FOR INSERT 
WITH CHECK (true);

-- Verify no other INSERT policies exist
-- (This is just a comment - the above should be the only INSERT policy)
-- Fix TEST_ASSESSMENT_ID mismatch in RLS policy
-- The code uses '08a5f01a-db17-474d-a3e8-c53bedbc34c8' but the RLS policy uses '2631edf1-a358-4303-83c1-deb9664b53e2'

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access to test assessment" ON public.assessment_results;

-- Create the policy with the correct TEST_ASSESSMENT_ID that matches the code
CREATE POLICY "Allow access to test assessment" 
ON public.assessment_results 
FOR ALL 
USING (id = '08a5f01a-db17-474d-a3e8-c53bedbc34c8')
WITH CHECK (id = '08a5f01a-db17-474d-a3e8-c53bedbc34c8');

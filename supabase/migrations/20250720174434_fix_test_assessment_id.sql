-- Fix TEST_ASSESSMENT_ID mismatch in RLS policy
-- The code uses '4a404fb0-311d-464b-8278-10df1b151ea4' but the RLS policy uses '2631edf1-a358-4303-83c1-deb9664b53e2'

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access to test assessment" ON public.assessment_results;

-- Create the policy with the correct TEST_ASSESSMENT_ID that matches the code
CREATE POLICY "Allow access to test assessment" 
ON public.assessment_results 
FOR ALL 
USING (id = '4a404fb0-311d-464b-8278-10df1b151ea4')
WITH CHECK (id = '4a404fb0-311d-464b-8278-10df1b151ea4');

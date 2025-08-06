-- Update temp_assessment_data table to expire after 2 hours instead of 12 hours
-- Run this in the Supabase Dashboard SQL Editor

-- Update the default expiration time to 2 hours
ALTER TABLE public.temp_assessment_data 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '2 hours');

-- Note: This change will only affect new records. Existing records will keep their original expiry times. 
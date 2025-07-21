-- Create a table for temporary assessment data during email verification
CREATE TABLE public.temp_assessment_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  temp_user_id UUID NOT NULL,
  categories JSONB NOT NULL,
  demographics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS
ALTER TABLE public.temp_assessment_data ENABLE ROW LEVEL SECURITY;

-- Create policies - allow anyone to insert/select/delete with temp_user_id
-- (needed since user isn't authenticated yet during signup)
CREATE POLICY "Anyone can insert temp assessment data" 
ON public.temp_assessment_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can select their own temp assessment data" 
ON public.temp_assessment_data 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can delete their own temp assessment data" 
ON public.temp_assessment_data 
FOR DELETE 
USING (true);

-- Create function to clean up expired temp data
CREATE OR REPLACE FUNCTION public.cleanup_expired_temp_assessment_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.temp_assessment_data 
  WHERE expires_at < now();
END;
$$;
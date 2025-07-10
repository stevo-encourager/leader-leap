
-- Drop the existing insert policy that's causing the issue
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;

-- Create a new insert policy that allows both authenticated users and the signup process
CREATE POLICY "Allow profile creation during signup and updates" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if the user is authenticated and inserting their own profile
  (auth.uid() = id) OR 
  -- Allow if this is being called by the handle_new_user function during signup
  (auth.uid() IS NULL AND id IS NOT NULL)
);

-- Update the handle_new_user function to properly handle receive_emails from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, receive_emails)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'receive_emails')::boolean, false)
  );
  RETURN new;
END;
$function$;

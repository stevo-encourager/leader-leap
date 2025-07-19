-- Add missing fields to profiles table
-- This migration adds the is_admin field that the frontend expects

-- Step 1: Add is_admin field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Set admin users
UPDATE public.profiles 
SET is_admin = true
WHERE email IN (
  'admin@encouragercoaching.com',
  'steve@encourager.co.uk',
  'steve.b.thompson@encourager.co.uk'
);

-- Step 3: Update the handle_new_user function to include is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, surname, receive_emails, is_admin)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.raw_user_meta_data->>'first_name' IS NOT NULL 
      THEN new.raw_user_meta_data->>'first_name'
      WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL 
      THEN CASE 
        WHEN position(' ' in (new.raw_user_meta_data->>'full_name')) = 0 
        THEN new.raw_user_meta_data->>'full_name'
        ELSE substring((new.raw_user_meta_data->>'full_name') from 1 for position(' ' in (new.raw_user_meta_data->>'full_name')) - 1)
      END
      ELSE NULL
    END,
    CASE 
      WHEN new.raw_user_meta_data->>'surname' IS NOT NULL 
      THEN new.raw_user_meta_data->>'surname'
      WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL 
      THEN CASE 
        WHEN position(' ' in (new.raw_user_meta_data->>'full_name')) = 0 
        THEN NULL
        ELSE substring((new.raw_user_meta_data->>'full_name') from position(' ' in (new.raw_user_meta_data->>'full_name')) + 1)
      END
      ELSE NULL
    END,
    COALESCE((new.raw_user_meta_data->>'receive_emails')::boolean, true),
    false -- Default to non-admin
  );
  RETURN new;
END;
$function$; 
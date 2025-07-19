-- Migration: Add first_name and surname columns to profiles table
-- This migration safely adds the new name fields and handles existing data

-- Step 1: Add the new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS surname VARCHAR(255);

-- Step 2: Create a function to split full_name into first_name and surname
CREATE OR REPLACE FUNCTION split_full_name(full_name TEXT)
RETURNS TABLE(first_name TEXT, surname TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle null or empty full_name
  IF full_name IS NULL OR full_name = '' THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Split by space and take first part as first_name, rest as surname
  RETURN QUERY 
  SELECT 
    TRIM(SPLIT_PART(full_name, ' ', 1))::TEXT as first_name,
    TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))::TEXT as surname;
END;
$$;

-- Step 3: Update existing profiles with split names
UPDATE public.profiles 
SET 
  first_name = (SELECT first_name FROM split_full_name(full_name)),
  surname = (SELECT surname FROM split_full_name(full_name))
WHERE full_name IS NOT NULL AND full_name != '';

-- Step 4: Set up admin user (Steve Thompson)
UPDATE public.profiles 
SET 
  first_name = 'Steve',
  surname = 'Thompson'
WHERE email = 'steve.b.thompson@encourager.co.uk';

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_surname ON public.profiles(surname);

-- Step 6: Update the handle_new_user function to handle first_name and surname
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, surname, full_name, receive_emails)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'surname',
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'receive_emails')::boolean, null)
  );
  RETURN new;
END;
$function$;

-- Step 7: Show the results of the migration
SELECT 'Migration completed. Current profiles:' as status;
SELECT 
  id,
  email,
  first_name,
  surname,
  full_name,
  CASE 
    WHEN first_name IS NOT NULL AND surname IS NOT NULL THEN '✅ Split successfully'
    WHEN full_name IS NOT NULL THEN '⚠️ Could not split'
    ELSE '❌ No name data'
  END as status
FROM public.profiles
ORDER BY email; 
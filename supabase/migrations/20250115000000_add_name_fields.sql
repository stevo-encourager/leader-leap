-- Add first_name and surname fields to profiles table
-- This migration splits the full_name field into first_name and surname

-- Step 1: Add new columns
ALTER TABLE profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN surname TEXT;

-- Step 2: Split existing full_name data
UPDATE profiles 
SET 
  first_name = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN NULL
    WHEN position(' ' in full_name) = 0 THEN full_name
    ELSE substring(full_name from 1 for position(' ' in full_name) - 1)
  END,
  surname = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN NULL
    WHEN position(' ' in full_name) = 0 THEN NULL
    ELSE substring(full_name from position(' ' in full_name) + 1)
  END
WHERE full_name IS NOT NULL;

-- Step 3: Update admin user with proper name split
UPDATE profiles 
SET 
  first_name = 'Admin',
  surname = 'User'
WHERE email = 'admin@encouragercoaching.com';

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_surname ON profiles(surname);

-- Step 5: Update the user creation trigger to handle name fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, surname, created_at, updated_at)
  VALUES (
    new.id, 
    new.email,
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
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  surname TEXT,
  receive_emails BOOLEAN DEFAULT true,
  gdpr_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_surname ON profiles(surname);

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, surname, receive_emails)
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
    COALESCE((new.raw_user_meta_data->>'receive_emails')::boolean, true)
  );
  RETURN new;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 
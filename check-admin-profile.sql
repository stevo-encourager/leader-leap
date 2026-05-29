-- Check if your admin profile is set up correctly
-- Run this in Supabase SQL Editor

-- Check your current profile
SELECT 
  id,
  email,
  first_name,
  surname,
  is_admin,
  created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Check if there are any profiles with is_admin = true
SELECT 
  'Admin profiles found' AS description,
  COUNT(*) AS count
FROM public.profiles 
WHERE is_admin = true;

-- If you need to set your profile as admin, find your email and run:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@example.com';
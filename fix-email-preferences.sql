-- Fix Email Preferences Issue
-- Run this script in your Supabase SQL Editor
-- This will fix the email preferences for existing users and set up the trigger for future users

-- Step 1: Create the trigger for future user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Show current state before fixing
SELECT 'BEFORE FIX - Current state:' as status;
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.receive_emails as profile_receive_emails,
  u.raw_user_meta_data->>'receive_emails' as metadata_receive_emails,
  CASE 
    WHEN p.receive_emails IS NULL THEN 'NULL'
    WHEN p.receive_emails = true THEN 'TRUE'
    WHEN p.receive_emails = false THEN 'FALSE'
    ELSE 'UNKNOWN'
  END as profile_status
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.email;

-- Step 3: Update existing users' email preferences based on their metadata
UPDATE public.profiles 
SET receive_emails = (
  SELECT COALESCE((raw_user_meta_data->>'receive_emails')::boolean, false)
  FROM auth.users 
  WHERE auth.users.id = profiles.id
)
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'receive_emails' IS NOT NULL
);

-- Step 4: Create profiles for users who don't have them
INSERT INTO public.profiles (id, email, full_name, receive_emails)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  COALESCE((raw_user_meta_data->>'receive_emails')::boolean, false)
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Show the results after fixing
SELECT 'AFTER FIX - Updated state:' as status;
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.receive_emails as profile_receive_emails,
  u.raw_user_meta_data->>'receive_emails' as metadata_receive_emails,
  CASE 
    WHEN p.receive_emails = true THEN '✅ SUBSCRIBED'
    WHEN p.receive_emails = false THEN '❌ UNSUBSCRIBED'
    WHEN p.receive_emails IS NULL THEN '❓ UNKNOWN'
    ELSE '❓ UNKNOWN'
  END as status
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.email;

-- Step 6: Summary
SELECT 'SUMMARY:' as summary;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN receive_emails = true THEN 1 END) as subscribed,
  COUNT(CASE WHEN receive_emails = false THEN 1 END) as unsubscribed,
  COUNT(CASE WHEN receive_emails IS NULL THEN 1 END) as unknown
FROM public.profiles; 
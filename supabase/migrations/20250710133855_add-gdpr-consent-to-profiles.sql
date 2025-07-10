-- Add gdpr_consent column to profiles table
ALTER TABLE public.profiles ADD COLUMN gdpr_consent boolean DEFAULT false;

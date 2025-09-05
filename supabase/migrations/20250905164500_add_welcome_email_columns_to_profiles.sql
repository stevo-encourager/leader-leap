-- Add welcome email tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS welcome_email_id text;
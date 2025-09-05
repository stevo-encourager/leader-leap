-- Add columns to track welcome email sending
ALTER TABLE assessment_results 
ADD COLUMN welcome_email_sent_at TIMESTAMPTZ,
ADD COLUMN welcome_email_id TEXT;
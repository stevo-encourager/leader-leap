-- Clean up any PROCESSING markers that are blocking welcome emails
UPDATE profiles 
SET welcome_email_sent_at = NULL, welcome_email_id = NULL
WHERE welcome_email_id = 'PROCESSING';

-- Check if any users had PROCESSING markers
SELECT count(*) as cleaned_users FROM profiles 
WHERE welcome_email_id IS NULL AND welcome_email_sent_at IS NULL;
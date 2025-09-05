-- Create a function to handle welcome email sending
CREATE OR REPLACE FUNCTION send_welcome_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Only proceed if email_confirmed_at was just set (changed from NULL to a value)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Get user details from auth.users
    SELECT email, raw_user_meta_data 
    INTO user_record 
    FROM auth.users 
    WHERE id = NEW.id;
    
    -- Check if this is a recent signup (within last 10 minutes) and welcome email not sent
    IF NEW.created_at > NOW() - INTERVAL '10 minutes' AND NEW.welcome_email_sent_at IS NULL THEN
      
      -- Call the Edge Function to send welcome email
      PERFORM
        net.http_post(
          url := current_setting('app.settings.supabase_url') || '/functions/v1/send-welcome-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'userId', NEW.id::text,
            'userEmail', user_record.email,
            'userName', COALESCE(
              user_record.raw_user_meta_data->>'first_name',
              user_record.raw_user_meta_data->>'full_name'
            )
          )
        );
        
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS welcome_email_trigger ON auth.users;
CREATE TRIGGER welcome_email_trigger
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email_trigger();
-- Update the full_name for the existing accounting account
UPDATE profiles 
SET full_name = first_name || ' ' || surname 
WHERE email = 'accounting@encourager.co.uk' 
AND first_name IS NOT NULL 
AND surname IS NOT NULL;

-- Create a trigger function to automatically populate full_name for new users
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if first_name and surname are not null
    IF NEW.first_name IS NOT NULL AND NEW.surname IS NOT NULL THEN
        NEW.full_name = NEW.first_name || ' ' || NEW.surname;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically populate full_name on insert or update
DROP TRIGGER IF EXISTS trigger_update_full_name ON profiles;
CREATE TRIGGER trigger_update_full_name
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_full_name(); 
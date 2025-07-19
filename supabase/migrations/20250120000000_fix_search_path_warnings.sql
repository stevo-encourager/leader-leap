-- Migration: Fix search path warnings for functions
-- This migration addresses the Security Advisor warnings about mutable search paths

-- Fix split_full_name function
CREATE OR REPLACE FUNCTION split_full_name(full_name TEXT)
RETURNS TABLE(first_name TEXT, surname TEXT)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle null or empty full_name
  IF full_name IS NULL OR full_name = '' THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Split by space and take first part as first_name, rest as surname
  RETURN QUERY 
  SELECT 
    TRIM(SPLIT_PART(full_name, ' ', 1))::TEXT as first_name,
    TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))::TEXT as surname;
END;
$$;

-- Fix update_full_name function
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    -- Only update if first_name and surname are not null
    IF NEW.first_name IS NOT NULL AND NEW.surname IS NOT NULL THEN
        NEW.full_name = NEW.first_name || ' ' || NEW.surname;
    END IF;
    RETURN NEW;
END;
$$; 
-- Update temp_assessment_data table to use email instead of temp_user_id
ALTER TABLE temp_assessment_data 
DROP COLUMN temp_user_id,
ADD COLUMN email TEXT NOT NULL;
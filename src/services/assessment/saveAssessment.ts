
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '../../utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';

/**
 * Saves the assessment results to the database
 * @param categories An array of categories with their respective scores
 * @param demographics An object containing the user's demographic information
 * @returns A success or error message
 */
export const saveAssessmentResults = async (categories: Category[], demographics: Demographics) => {
  try {
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Saving assessment with categories:', categories);
    
    // Check if the categories have valid ratings before saving
    const hasValidRatings = categories.some(category => 
      category.skills && category.skills.some(skill => 
        skill.ratings && typeof skill.ratings.current === 'number' && 
        typeof skill.ratings.desired === 'number'
      )
    );
    
    if (!hasValidRatings) {
      console.error('Cannot save assessment: No valid ratings found in categories');
      return { success: false, error: 'No valid ratings found in assessment data' };
    }
    
    // Get the current date in YYYY-MM-DD format to check for existing assessments today
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = today + 'T00:00:00Z';
    const endOfDay = today + 'T23:59:59Z';
    
    console.log(`Checking for assessments between ${startOfDay} and ${endOfDay}`);
    
    // Check if the user already has an assessment from today
    const { data: todaysAssessments, error: checkError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking today\'s assessments:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // If there's already an assessment from today, update it instead of creating a new one
    if (todaysAssessments && todaysAssessments.length > 0) {
      console.log('Found existing assessment from today, updating it:', todaysAssessments[0].id);
      return await updateExistingAssessment(todaysAssessments[0].id, categories, demographics);
    }
    
    // Check for any incomplete assessment
    const { data: incompleteAssessments, error: incompleteCheckError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .is('completed', null)
      .limit(1);
      
    if (incompleteCheckError) {
      console.error('Error checking incomplete assessments:', incompleteCheckError);
      return { success: false, error: incompleteCheckError.message };
    }
    
    // If there's an incomplete assessment, update it
    if (incompleteAssessments && incompleteAssessments.length > 0) {
      console.log('Found incomplete assessment, updating it:', incompleteAssessments[0].id);
      return await updateExistingAssessment(incompleteAssessments[0].id, categories, demographics);
    }
    
    // If there's no assessment from today and no incomplete assessment, create a new one
    console.log('No existing assessment found, creating new one');
    return await createNewAssessment(user.id, categories, demographics);
  } catch (error) {
    console.error('Error in saveAssessmentResults:', error);
    return { success: false, error: 'Failed to save assessment results' };
  }
};

/**
 * Updates an existing assessment in the database
 * @param assessmentId The ID of the assessment to update
 * @param categories The updated categories data
 * @param demographics The updated demographics data
 * @returns A success or error message
 */
const updateExistingAssessment = async (
  assessmentId: string, 
  categories: Category[], 
  demographics: Demographics
) => {
  console.log('Updating existing assessment:', assessmentId);
  
  const { data, error } = await supabase
    .from('assessment_results')
    .update({
      categories: categories as unknown as Json,
      demographics: demographics as unknown as Json,
      completed: true
    })
    .eq('id', assessmentId)
    .select();
    
  if (error) {
    console.error('Error updating assessment results:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
};

/**
 * Creates a new assessment in the database
 * @param userId The ID of the user creating the assessment
 * @param categories The categories data
 * @param demographics The demographics data
 * @returns A success or error message
 */
const createNewAssessment = async (
  userId: string,
  categories: Category[],
  demographics: Demographics
) => {
  console.log('Creating new assessment record');
  
  // Use insert with onConflict strategy to prevent duplicates at the database level
  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      categories: categories as unknown as Json,
      demographics: demographics as unknown as Json,
      user_id: userId,
      completed: true
    })
    .select();

  if (error) {
    console.error('Error saving assessment results:', error);
    return { success: false, error: error.message };
  }

  console.log('Successfully saved assessment results:', data);
  return { success: true, data };
};

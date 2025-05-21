
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '../utils/assessmentTypes';
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
    
    // Check if the user already has a pending assessment
    const { data: existingAssessments, error: checkError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .is('completed', null);
      
    if (checkError) {
      console.error('Error checking existing assessments:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // If there's an existing incomplete assessment, update it instead of creating a new one
    if (existingAssessments && existingAssessments.length > 0) {
      const { data, error } = await supabase
        .from('assessment_results')
        .update({
          categories: categories as unknown as Json,
          demographics: demographics as unknown as Json,
          completed: true
        })
        .eq('id', existingAssessments[0].id)
        .select();
        
      if (error) {
        console.error('Error updating assessment results:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    }
    
    // Otherwise, create a new completed assessment
    const { data, error } = await supabase
      .from('assessment_results')
      .insert({
        categories: categories as unknown as Json,
        demographics: demographics as unknown as Json,
        user_id: user.id,
        completed: true
      })
      .select();

    if (error) {
      console.error('Error saving assessment results:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveAssessmentResults:', error);
    return { success: false, error: 'Failed to save assessment results' };
  }
};

/**
 * Retrieves the latest assessment results for the logged-in user
 * @returns An array of categories with their respective scores, or null if no results are found
 */
export const getLatestAssessmentResults = async () => {
  try {
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest assessment results:', error);
      return { success: false, error: error.message };
    }

    if (!assessments || assessments.length === 0) {
      return { success: false, data: null };
    }

    return { success: true, data: assessments[0] };
  } catch (error) {
    console.error('Error in getLatestAssessmentResults:', error);
    return { success: false, error: 'Failed to fetch latest assessment results' };
  }
};

/**
 * Fetches the user's assessment history
 * @returns An array of assessment objects with their results
 */
export const getAssessmentHistory = async () => {
  try {
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Only get completed assessments with distinct IDs
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessment history:', error);
      return { success: false, error: error.message };
    }

    // Log the raw data for debugging
    console.log('Raw assessment history:', assessments);

    // Deduplicate by ID here in the service layer
    const uniqueAssessmentsMap = new Map();
    assessments.forEach(assessment => {
      if (!uniqueAssessmentsMap.has(assessment.id)) {
        uniqueAssessmentsMap.set(assessment.id, assessment);
      }
    });
    
    const uniqueAssessments = Array.from(uniqueAssessmentsMap.values());
    console.log('Deduplicated assessments count:', uniqueAssessments.length);

    return { success: true, data: uniqueAssessments };
  } catch (error) {
    console.error('Error in getAssessmentHistory:', error);
    return { success: false, error: 'Failed to fetch assessment history' };
  }
};

/**
 * Fetches a specific assessment result by ID
 * @param id The ID of the assessment to fetch
 * @returns The assessment data or null if not found
 */
export const getAssessmentById = async (id: string) => {
  try {
    const { data: assessment, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching assessment by ID:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully retrieved assessment by ID:', assessment);
    return { success: true, data: assessment };
  } catch (error) {
    console.error('Error in getAssessmentById:', error);
    return { success: false, error: 'Failed to fetch assessment by ID' };
  }
};

/**
 * Deletes all completed assessments for the current user
 * @returns Success or error message
 */
export const deleteAllCompletedAssessments = async () => {
  try {
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Delete all completed assessments for the current user
    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) {
      console.error('Error deleting assessments:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'All completed assessments deleted successfully' };
  } catch (error) {
    console.error('Error in deleteAllCompletedAssessments:', error);
    return { success: false, error: 'Failed to delete assessments' };
  }
};

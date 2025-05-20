import { supabase } from '../supabaseClient';
import { Category, Demographics } from '../utils/assessmentData';

/**
 * Saves the assessment results to the database
 * @param categories An array of categories with their respective scores
 * @param demographics An object containing the user's demographic information
 * @returns A success or error message
 */
export const saveAssessmentResults = async (categories: Category[], demographics: Demographics) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert([
        { 
          categories, 
          demographics,
          user_id: supabase.auth.user()?.id // Ensure user is logged in
        }
      ]);

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
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
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
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessment history:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: assessments };
  } catch (error) {
    console.error('Error in getAssessmentHistory:', error);
    return { success: false, error: 'Failed to fetch assessment history' };
  }
};

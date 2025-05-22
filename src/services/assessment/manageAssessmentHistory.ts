
import { supabase } from '@/integrations/supabase/client';

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
    
    console.log('getAssessmentHistory - Fetching for user:', user.id);
    
    // After our database cleanup, we should have only unique assessment IDs
    // We'll still implement a safety check on the client side
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAssessmentHistory - Error fetching data:', error);
      return { success: false, error: error.message };
    }

    // Log the raw data for debugging
    console.log('getAssessmentHistory - Raw data from database:', assessments);
    console.log('getAssessmentHistory - Raw data count:', assessments?.length || 0);
    
    if (!assessments || assessments.length === 0) {
      console.log('getAssessmentHistory - No history found');
      return { success: true, data: [] };
    }

    // While the database should now be clean, we'll still maintain this client-side
    // deduplication as a safety measure against future duplicates
    const uniqueIds = new Set();
    const uniqueAssessments = assessments.filter(assessment => {
      if (uniqueIds.has(assessment.id)) {
        return false;
      }
      uniqueIds.add(assessment.id);
      return true;
    });
    
    console.log('getAssessmentHistory - Unique assessments count:', uniqueAssessments.length);
    
    return { success: true, data: uniqueAssessments };
  } catch (error) {
    console.error('getAssessmentHistory - Error:', error);
    return { success: false, error: 'Failed to fetch assessment history' };
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

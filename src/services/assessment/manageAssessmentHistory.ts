
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';

/**
 * Stores assessment data in the browser's local storage for immediate access
 * This provides a fallback if database storage fails or user is not authenticated
 */
export const storeLocalAssessmentData = (categories: Category[], demographics: Demographics) => {
  try {
    console.log("storeLocalAssessmentData - Storing assessment data locally:", {
      categoriesCount: categories?.length || 0,
      hasRatings: categories?.some(cat => 
        cat?.skills?.some(skill => 
          skill?.ratings?.current > 0 || skill?.ratings?.desired > 0
        )
      ),
      demographicsProvided: !!demographics
    });
    
    // Store the categories and demographics in localStorage
    localStorage.setItem('assessment_categories', JSON.stringify(categories));
    localStorage.setItem('assessment_demographics', JSON.stringify(demographics));
    localStorage.setItem('assessment_timestamp', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error("Error storing local assessment data:", error);
    return false;
  }
};

/**
 * Retrieves locally stored assessment data
 */
export const getLocalAssessmentData = () => {
  try {
    const categoriesStr = localStorage.getItem('assessment_categories');
    const demographicsStr = localStorage.getItem('assessment_demographics');
    const timestamp = localStorage.getItem('assessment_timestamp');
    
    if (!categoriesStr) {
      console.log("getLocalAssessmentData - No local assessment data found");
      return null;
    }
    
    const categories = JSON.parse(categoriesStr);
    const demographics = demographicsStr ? JSON.parse(demographicsStr) : {};
    
    console.log("getLocalAssessmentData - Retrieved local assessment data:", {
      categoriesCount: categories?.length || 0,
      timestamp: timestamp || 'unknown'
    });
    
    return { categories, demographics, timestamp };
  } catch (error) {
    console.error("Error retrieving local assessment data:", error);
    return null;
  }
};

/**
 * Clear local assessment data when no longer needed
 */
export const clearLocalAssessmentData = () => {
  try {
    localStorage.removeItem('assessment_categories');
    localStorage.removeItem('assessment_demographics');
    localStorage.removeItem('assessment_timestamp');
    return true;
  } catch (error) {
    console.error("Error clearing local assessment data:", error);
    return false;
  }
};

/**
 * Retrieve assessment history from the database
 * Returns a list of previous assessments for the current user
 */
export const getAssessmentHistory = async () => {
  try {
    console.log("getAssessmentHistory - Starting fetch");
    
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("getAssessmentHistory - User not authenticated");
      return { success: false, error: 'User not authenticated' };
    }
    
    // Fetch all completed assessments for this user
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("getAssessmentHistory - Error fetching history:", error);
      return { success: false, error: error.message };
    }
    
    console.log(`getAssessmentHistory - Found ${assessments?.length || 0} assessments`);
    
    return { 
      success: true, 
      data: assessments 
    };
  } catch (error) {
    console.error("Error in getAssessmentHistory:", error);
    return { success: false, error: 'Failed to fetch assessment history' };
  }
};

/**
 * Delete an assessment by ID
 */
export const deleteAssessment = async (assessmentId: string) => {
  try {
    console.log("deleteAssessment - Deleting assessment:", assessmentId);
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("deleteAssessment - User not authenticated");
      return { success: false, error: 'User not authenticated' };
    }
    
    // Delete the assessment
    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('id', assessmentId)
      .eq('user_id', user.id); // Ensure user can only delete their own assessments
      
    if (error) {
      console.error("deleteAssessment - Error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("deleteAssessment - Successfully deleted");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAssessment:", error);
    return { success: false, error: 'Failed to delete assessment' };
  }
};

/**
 * Delete all assessments for the current user
 */
export const deleteAllAssessments = async () => {
  try {
    console.log("deleteAllAssessments - Starting");
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("deleteAllAssessments - User not authenticated");
      return { success: false, error: 'User not authenticated' };
    }
    
    // Delete all assessments for this user
    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', user.id);
      
    if (error) {
      console.error("deleteAllAssessments - Error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("deleteAllAssessments - Successfully deleted all assessments");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAllAssessments:", error);
    return { success: false, error: 'Failed to delete all assessments' };
  }
};

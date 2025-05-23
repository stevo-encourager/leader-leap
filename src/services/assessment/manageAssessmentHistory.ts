
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';
import { 
  AssessmentSummary, 
  LocalAssessmentData 
} from '@/types/assessment';

/**
 * Stores assessment data in the browser's local storage for immediate access
 * This provides a fallback if database storage fails or user is not authenticated
 */
export const storeLocalAssessmentData = (categories: Category[], demographics: Demographics): boolean => {
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
    
    // Debug the first category's ratings before storage
    if (categories && categories.length > 0 && categories[0].skills && categories[0].skills.length > 0) {
      console.log("storeLocalAssessmentData - Sample data before storage:", 
        JSON.stringify({
          category: categories[0].title,
          skill: categories[0].skills[0].name,
          ratings: categories[0].skills[0].ratings
        })
      );
    }
    
    // Ensure we have a deep copy to avoid reference issues
    const categoriesToStore = JSON.parse(JSON.stringify(categories));
    
    // Store the categories and demographics in localStorage
    localStorage.setItem('assessment_categories', JSON.stringify(categoriesToStore));
    localStorage.setItem('assessment_demographics', JSON.stringify(demographics));
    localStorage.setItem('assessment_timestamp', new Date().toISOString());
    
    // Verify the data was stored correctly by reading it back
    const storedData = localStorage.getItem('assessment_categories');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData && parsedData.length > 0 && parsedData[0].skills && parsedData[0].skills.length > 0) {
        console.log("storeLocalAssessmentData - Verification of stored data:", 
          JSON.stringify({
            category: parsedData[0].title,
            skill: parsedData[0].skills[0].name,
            ratings: parsedData[0].skills[0].ratings
          })
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error storing local assessment data:", error);
    return false;
  }
};

/**
 * Retrieves locally stored assessment data
 */
export const getLocalAssessmentData = (): LocalAssessmentData | null => {
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
    
    // Debug the first category's ratings after retrieval
    if (categories && categories.length > 0 && categories[0].skills && categories[0].skills.length > 0) {
      console.log("getLocalAssessmentData - Sample data after retrieval:", 
        JSON.stringify({
          category: categories[0].title,
          skill: categories[0].skills[0].name,
          ratings: categories[0].skills[0].ratings
        })
      );
    }
    
    return { 
      categories, 
      demographics, 
      timestamp: timestamp || new Date().toISOString() 
    };
  } catch (error) {
    console.error("Error retrieving local assessment data:", error);
    return null;
  }
};

/**
 * Clear local assessment data when no longer needed
 */
export const clearLocalAssessmentData = (): boolean => {
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
export const getAssessmentHistory = async (): Promise<{ 
  success: boolean; 
  data?: AssessmentSummary[]; 
  error?: string 
}> => {
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
export const deleteAssessment = async (assessmentId: string): Promise<{ 
  success: boolean; 
  error?: string 
}> => {
  try {
    console.log("deleteAssessment - Deleting assessment:", assessmentId);
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("deleteAssessment - User not authenticated");
      return { success: false, error: 'User not authenticated' };
    }
    
    // First check if the assessment exists and belongs to this user
    const { data: existingAssessment, error: fetchError } = await supabase
      .from('assessment_results')
      .select('id, user_id')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError) {
      console.error("deleteAssessment - Error checking assessment existence:", fetchError);
      return { success: false, error: 'Assessment not found or access denied' };
    }
    
    if (!existingAssessment) {
      console.error("deleteAssessment - Assessment not found for user");
      return { success: false, error: 'Assessment not found' };
    }
    
    // Delete the assessment
    const { error: deleteError, count } = await supabase
      .from('assessment_results')
      .delete({ count: 'exact' })
      .eq('id', assessmentId)
      .eq('user_id', user.id);
      
    if (deleteError) {
      console.error("deleteAssessment - Delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }
    
    console.log(`deleteAssessment - Successfully deleted ${count} record(s)`);
    
    if (count === 0) {
      console.warn("deleteAssessment - No records were deleted");
      return { success: false, error: 'No records were deleted' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAssessment:", error);
    return { success: false, error: 'Failed to delete assessment' };
  }
};

/**
 * Delete all assessments for the current user
 */
export const deleteAllAssessments = async (): Promise<{ 
  success: boolean; 
  error?: string 
}> => {
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

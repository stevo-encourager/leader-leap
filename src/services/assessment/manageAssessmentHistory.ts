
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';

const LOCAL_STORAGE_KEYS = {
  CATEGORIES: 'assessment_categories',
  DEMOGRAPHICS: 'assessment_demographics',
  TIMESTAMP: 'assessment_timestamp'
};

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
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesToStore));
    localStorage.setItem(LOCAL_STORAGE_KEYS.DEMOGRAPHICS, JSON.stringify(demographics));
    localStorage.setItem(LOCAL_STORAGE_KEYS.TIMESTAMP, new Date().toISOString());
    
    // Verify the data was stored correctly by reading it back
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
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
export const getLocalAssessmentData = () => {
  try {
    const categoriesStr = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    const demographicsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.DEMOGRAPHICS);
    const timestamp = localStorage.getItem(LOCAL_STORAGE_KEYS.TIMESTAMP);
    
    if (!categoriesStr) {
      console.log("getLocalAssessmentData - No local assessment data found");
      return null;
    }
    
    const rawCategories = JSON.parse(categoriesStr);
    const demographics = demographicsStr ? JSON.parse(demographicsStr) : {};
    
    // Ensure ratings are parsed as numbers
    const categories = rawCategories.map((category: any) => {
      if (category && category.skills && Array.isArray(category.skills)) {
        category.skills = category.skills.map((skill: any) => {
          if (skill && skill.ratings) {
            // Convert ratings to numbers explicitly
            const current = typeof skill.ratings.current !== 'undefined' ? Number(skill.ratings.current) : 0;
            const desired = typeof skill.ratings.desired !== 'undefined' ? Number(skill.ratings.desired) : 0;
            
            skill.ratings = {
              current: isNaN(current) ? 0 : current,
              desired: isNaN(desired) ? 0 : desired
            };
          }
          return skill;
        });
      }
      return category;
    });
    
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
      
      // Check if we have any valid ratings (non-zero)
      const hasRatings = categories.some((cat: any) => 
        cat && cat.skills && cat.skills.some((skill: any) => 
          skill && skill.ratings && (skill.ratings.current > 0 || skill.ratings.desired > 0)
        )
      );
      
      console.log("getLocalAssessmentData - Local data has valid ratings:", hasRatings);
    }
    
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
    console.log("clearLocalAssessmentData - Clearing local assessment data");
    
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DEMOGRAPHICS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TIMESTAMP);
    
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

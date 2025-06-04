import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';
import { 
  AssessmentSummary, 
  LocalAssessmentData 
} from '@/types/assessment';

// Update the AssessmentSummary interface in this file or ensure it's properly defined in types/assessment.ts
interface AssessmentRecord {
  id: string;
  created_at: string;
  completed?: boolean;
}

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
export const getAssessmentHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('assessment_results')
      .select('id, created_at, completed')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessment history:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getAssessmentHistory:', error);
    return { success: false, error: 'Failed to fetch assessment history' };
  }
};

/**
 * Delete an assessment by ID
 */
export const deleteAssessment = async (assessmentId: string) => {
  try {
    // Protected test assessment ID - cannot be deleted
    const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
    
    if (assessmentId === TEST_ASSESSMENT_ID) {
      return { 
        success: false, 
        error: "This test assessment is protected and cannot be deleted" 
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // First verify the assessment belongs to the current user
    const { data: assessment, error: fetchError } = await supabase
      .from('assessment_results')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (fetchError) {
      console.error('Error fetching assessment for deletion:', fetchError);
      return { success: false, error: 'Assessment not found' };
    }

    if (assessment.user_id !== user.id) {
      return { success: false, error: 'You can only delete your own assessments' };
    }

    // Proceed with deletion
    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('id', assessmentId)
      .eq('user_id', user.id); // Extra safety check

    if (error) {
      console.error('Error deleting assessment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteAssessment:', error);
    return { success: false, error: 'Failed to delete assessment' };
  }
};

/**
 * Delete all assessments for the current user
 */
export const deleteAllAssessments = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Protected test assessment ID - exclude from bulk deletion
    const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';

    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', user.id)
      .neq('id', TEST_ASSESSMENT_ID); // Exclude the test assessment

    if (error) {
      console.error('Error deleting all assessments:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteAllAssessments:', error);
    return { success: false, error: 'Failed to delete assessments' };
  }
};

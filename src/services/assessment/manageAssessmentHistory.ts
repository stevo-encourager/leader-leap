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
    console.log('storeLocalAssessmentData - Storing categories:', categories.length);
    
    // Debug: Log rating data for first few skills
    categories.slice(0, 2).forEach((cat, catIndex) => {
      console.log(`storeLocalAssessmentData - Category ${catIndex}:`, cat.title, 'skills:', cat.skills?.length);
      cat.skills?.slice(0, 2).forEach((skill, skillIndex) => {
        console.log(`storeLocalAssessmentData - Skill ${skillIndex}:`, skill.name, 'ratings:', skill.ratings);
      });
    });
    
    // Ensure we have a deep copy to avoid reference issues
    const categoriesToStore = JSON.parse(JSON.stringify(categories));
    
    // Store the categories and demographics in localStorage
    localStorage.setItem('assessment_categories', JSON.stringify(categoriesToStore));
    localStorage.setItem('assessment_demographics', JSON.stringify(demographics));
    localStorage.setItem('assessment_timestamp', new Date().toISOString());
    
    console.log('storeLocalAssessmentData - Successfully stored to localStorage');
    
    return true;
  } catch (error) {
    console.error('storeLocalAssessmentData - Error storing to localStorage:', error);
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
    
    console.log('getLocalAssessmentData - Retrieved from localStorage:', {
      hasCategoriesStr: !!categoriesStr,
      categoriesLength: categoriesStr ? categoriesStr.length : 0,
      hasDemographicsStr: !!demographicsStr,
      timestamp
    });
    
    if (!categoriesStr) {
      console.log('getLocalAssessmentData - No categories found in localStorage');
      return null;
    }
    
    const categories = JSON.parse(categoriesStr);
    const demographics = demographicsStr ? JSON.parse(demographicsStr) : {};
    
    console.log('getLocalAssessmentData - Parsed data:', {
      categoriesCount: categories.length,
      firstCategoryTitle: categories[0]?.title,
      firstSkillRating: categories[0]?.skills?.[0]?.ratings
    });
    
    return { 
      categories, 
      demographics, 
      timestamp: timestamp || new Date().toISOString() 
    };
  } catch (error) {
    console.error('getLocalAssessmentData - Error retrieving from localStorage:', error);
    return null;
  }
};

/**
 * Preserve assessment data before email verification
 * Stores data with a special key that survives email verification redirects
 */
export const preserveAssessmentDataForVerification = (): boolean => {
  try {
    const localData = getLocalAssessmentData();
    if (!localData) {
      console.log('preserveAssessmentDataForVerification - No local data to preserve');
      return false;
    }
    
    // Store in a verification-specific key
    localStorage.setItem('assessment_verification_backup', JSON.stringify(localData));
    sessionStorage.setItem('assessment_verification_backup', JSON.stringify(localData));
    console.log('preserveAssessmentDataForVerification - Data preserved for verification');
    return true;
  } catch (error) {
    console.error('preserveAssessmentDataForVerification - Error:', error);
    return false;
  }
};

/**
 * Restore assessment data after email verification
 * Checks for preserved data and restores it to the main localStorage keys
 */
export const restoreAssessmentDataAfterVerification = (): boolean => {
  try {
    // Check both localStorage and sessionStorage for backup data
    let backupData = localStorage.getItem('assessment_verification_backup');
    if (!backupData) {
      backupData = sessionStorage.getItem('assessment_verification_backup');
    }
    
    if (!backupData) {
      console.log('restoreAssessmentDataAfterVerification - No backup data found');
      return false;
    }
    
    const parsedData = JSON.parse(backupData);
    
    // Restore to main localStorage keys
    localStorage.setItem('assessment_categories', JSON.stringify(parsedData.categories));
    localStorage.setItem('assessment_demographics', JSON.stringify(parsedData.demographics));
    localStorage.setItem('assessment_timestamp', parsedData.timestamp);
    
    // Clean up backup data
    localStorage.removeItem('assessment_verification_backup');
    sessionStorage.removeItem('assessment_verification_backup');
    
    console.log('restoreAssessmentDataAfterVerification - Data restored successfully');
    return true;
  } catch (error) {
    console.error('restoreAssessmentDataAfterVerification - Error:', error);
    return false;
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
    console.log('clearLocalAssessmentData - Successfully cleared local storage');
    return true;
  } catch (error) {
    console.error('clearLocalAssessmentData - Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Retrieve assessment history from the database
 * Returns a list of previous assessments for the current user
 */
export const getAssessmentHistory = async (): Promise<{ 
  success: boolean; 
  data?: AssessmentRecord[]; 
  error?: string 
}> => {
  try {
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Fetch all completed assessments for this user, excluding the test assessment
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('id, created_at, completed')
      .eq('user_id', user.id)
      .neq('id', '08a5f01a-db17-474d-a3e8-c53bedbc34c8') // Exclude test assessment
      .order('created_at', { ascending: false });
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data: ((assessments || []) as unknown) as AssessmentRecord[]
    };
  } catch (error) {
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
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Prevent deletion of the protected test assessment
    if (assessmentId === '08a5f01a-db17-474d-a3e8-c53bedbc34c8') {
      return { success: false, error: 'This test assessment cannot be deleted.' };
    }
    
    // First check if the assessment exists and belongs to this user
    const { data: existingAssessment, error: fetchError } = await supabase
      .from('assessment_results')
      .select('id, user_id')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError) {
      return { success: false, error: 'Assessment not found or access denied' };
    }
    
    if (!existingAssessment) {
      return { success: false, error: 'Assessment not found' };
    }
    
    // Delete the assessment
    const { error: deleteError, count } = await supabase
      .from('assessment_results')
      .delete({ count: 'exact' })
      .eq('id', assessmentId)
      .eq('user_id', user.id);
      
    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
    
    if (count === 0) {
      return { success: false, error: 'No records were deleted' };
    }
    
    return { success: true };
  } catch (error) {
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
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Delete all assessments for this user EXCEPT the protected test assessment
    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', user.id)
      .neq('id', '08a5f01a-db17-474d-a3e8-c53bedbc34c8');
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete all assessments' };
  }
};
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';
import { 
  AssessmentSummary, 
  LocalAssessmentData 
} from '@/types/assessment';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/productionLogger';

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
export const storeLocalAssessmentData = (categories: Category[], demographics: Demographics) => {
  try {
    const data = {
      categories,
      demographics,
      timestamp: Date.now()
    };
    
    localStorage.setItem('assessmentData', JSON.stringify(data));
  } catch (error) {
    logger.error('Error storing assessment data locally:', error);
  }
};

/**
 * Retrieves locally stored assessment data
 */
export const getLocalAssessmentData = (): { categories: Category[]; demographics: Demographics; timestamp: number } | null => {
  try {
    const data = localStorage.getItem('assessmentData');
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    logger.error('Error retrieving assessment data from localStorage:', error);
    return null;
  }
};

/**
 * Preserve assessment data before email verification by storing in database
 * Links the data to the email address so it can be retrieved after verification
 */
export const preserveAssessmentDataForVerification = async (email: string): Promise<boolean> => {
  try {
    const localData = getLocalAssessmentData();
    
    if (!localData || !localData.categories || localData.categories.length === 0) {
      return false;
    }

    const { data, error } = await supabase
      .from('temp_assessment_data')
      .insert({
        email,
        categories: JSON.parse(JSON.stringify(localData.categories)) as Json,
        demographics: JSON.parse(JSON.stringify(localData.demographics)) as Json,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      });

    if (error) {
      logger.error('Error preserving assessment data:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error preserving assessment data:', error);
    return false;
  }
};

/**
 * Restore assessment data after email verification from database
 * Retrieves the temporarily stored data and restores it to localStorage
 */
export const restoreAssessmentDataAfterVerification = async (email: string): Promise<boolean> => {
  try {
    // Retrieve the data from database using email
    const { data, error } = await supabase
      .from('temp_assessment_data')
      .select('categories, demographics')
      .eq('email', email)
      .single();
    
    if (error) {
      // Suppress 406 errors (no data found) as they're expected when there's nothing to restore
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return false;
      }
      logger.error('restoreAssessmentDataAfterVerification - Unexpected error:', error);
      return false;
    }
    
    if (!data) {
      return false;
    }
    
    // Cast to unknown first then to our expected type
    const tempData = (data as unknown) as { categories: any; demographics: any };
    
    // Restore to localStorage using the same format as storeLocalAssessmentData
    const restoredData = {
      categories: tempData.categories,
      demographics: tempData.demographics || {},
      timestamp: Date.now()
    };
    localStorage.setItem('assessmentData', JSON.stringify(restoredData));
    
    // Clean up - delete the temp record from database
    await supabase
      .from('temp_assessment_data')
      .delete()
      .eq('email', email);
    
    return true;
  } catch (error) {
    logger.error('restoreAssessmentDataAfterVerification - Error:', error);
    return false;
  }
};

/**
 * Save guest assessment data using synthetic tempUserId via Edge Function
 * This allows guest users to have their assessments saved to the database
 * with a temporary user ID before they sign up
 */
export const saveGuestAssessmentWithTempUserId = async (
  categories: Category[], 
  demographics: Demographics
): Promise<{ success: boolean; assessmentId?: string; tempUserId?: string; error?: string }> => {
  try {
    
    // Use direct fetch with explicit headers to avoid authentication issues
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !anonKey) {
      return { success: false, error: 'Missing Supabase configuration' };
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/save-guest-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        // Explicitly avoid Authorization header for guest users
      },
      body: JSON.stringify({
        categories,
        demographics
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('HTTP error saving guest assessment with tempUserId:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();

    if (data && data.success) {
      return { 
        success: true, 
        assessmentId: data.assessmentId,
        tempUserId: data.tempUserId
      };
    }

    return { success: false, error: data?.error || 'Unexpected response from server' };
  } catch (error) {
    logger.error('Exception saving guest assessment with tempUserId:', error);
    return { success: false, error: 'Network error saving assessment' };
  }
};

/**
 * Clear local assessment data when no longer needed
 */
export const clearLocalAssessmentData = (): boolean => {
  try {
    localStorage.removeItem('assessmentData');
    return true;
  } catch (error) {
    logger.error('clearLocalAssessmentData - Error clearing localStorage:', error);
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
      .neq('id', '4a404fb0-311d-464b-8278-10df1b151ea4') // Exclude test assessment
        .neq('id', 'b11beb1e-b6d6-4204-91f7-5673ed90dce5') // Exclude test assessment
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
    
          // Prevent deletion of the protected test assessments
      if (assessmentId === '4a404fb0-311d-464b-8278-10df1b151ea4' || assessmentId === 'b11beb1e-b6d6-4204-91f7-5673ed90dce5') {
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
      .neq('id', '4a404fb0-311d-464b-8278-10df1b151ea4')
        .neq('id', 'b11beb1e-b6d6-4204-91f7-5673ed90dce5');
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete all assessments' };
  }
};
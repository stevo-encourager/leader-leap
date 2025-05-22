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
    
    // Check if the user already has a completed assessment
    const { data: existingCompletedAssessments, error: checkError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .eq('completed', true);
      
    if (checkError) {
      console.error('Error checking existing assessments:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // If there's an existing incomplete assessment, update it instead of creating a new one
    // This prevents duplicate assessments from being created
    const { data: incompleteAssessments, error: incompleteCheckError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .is('completed', null);
      
    if (incompleteCheckError) {
      console.error('Error checking incomplete assessments:', incompleteCheckError);
      return { success: false, error: incompleteCheckError.message };
    }
    
    if (incompleteAssessments && incompleteAssessments.length > 0) {
      const { data, error } = await supabase
        .from('assessment_results')
        .update({
          categories: categories as unknown as Json,
          demographics: demographics as unknown as Json,
          completed: true
        })
        .eq('id', incompleteAssessments[0].id)
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

    console.log('Successfully saved assessment results:', data);
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
    
    console.log('getAssessmentHistory - Fetching for user:', user.id);
    
    // Get distinct completed assessments by ID, ordering by created_at
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

    // Create a Map to track unique assessment IDs
    // We'll use this to deduplicate the results
    const uniqueAssessmentMap = new Map();
    
    // Process each assessment and only keep the first one we encounter for each ID
    for (const assessment of assessments) {
      if (!uniqueAssessmentMap.has(assessment.id)) {
        uniqueAssessmentMap.set(assessment.id, assessment);
      }
    }
    
    // Convert the map values back to an array
    const uniqueAssessments = Array.from(uniqueAssessmentMap.values());
    
    console.log('getAssessmentHistory - After deduplication:', uniqueAssessments);
    console.log('getAssessmentHistory - Before count:', assessments.length, 'After count:', uniqueAssessments.length);
    
    return { success: true, data: uniqueAssessments };
  } catch (error) {
    console.error('getAssessmentHistory - Error:', error);
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
    console.log('getAssessmentById - Fetching assessment:', id);
    
    const { data: assessment, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('getAssessmentById - Error fetching:', error);
      return { success: false, error: error.message };
    }

    if (!assessment) {
      console.error('getAssessmentById - No assessment found with ID:', id);
      return { success: false, error: 'Assessment not found' };
    }
    
    console.log('getAssessmentById - Raw data:', assessment);
    console.log('getAssessmentById - Categories type:', typeof assessment.categories);
    
    // Fix any potential issues with the data format
    if (assessment && assessment.categories) {
      let categoriesData: any = assessment.categories;
      
      // Handle case where categories might be stored as a string
      if (typeof categoriesData === 'string') {
        try {
          categoriesData = JSON.parse(categoriesData);
          console.log('getAssessmentById - Parsed categories from string:', categoriesData);
        } catch (e) {
          console.error('getAssessmentById - Failed to parse categories string:', e);
        }
      }
      
      // Ensure we have an array to work with
      if (!Array.isArray(categoriesData)) {
        if (typeof categoriesData === 'object' && categoriesData !== null) {
          categoriesData = Object.values(categoriesData);
        } else {
          categoriesData = [];
        }
      }
      
      // Ensure all categories have properly formatted skills and ratings
      const fixedCategories = categoriesData.map((category: any) => ({
        ...category,
        id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
        title: category.title || 'Unknown Category',
        description: category.description || '',
        skills: (category.skills || []).map((skill: any) => ({
          id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
          name: skill.name || skill.competency || 'Unnamed Skill',
          description: skill.description || '',
          ratings: {
            current: typeof skill.ratings?.current === 'number' ? skill.ratings.current : 0,
            desired: typeof skill.ratings?.desired === 'number' ? skill.ratings.desired : 0
          }
        }))
      }));

      assessment.categories = fixedCategories as unknown as Json;
      console.log('getAssessmentById - Fixed categories:', fixedCategories);
    }

    return { success: true, data: assessment };
  } catch (error) {
    console.error('getAssessmentById - Error:', error);
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

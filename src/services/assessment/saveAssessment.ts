
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '../../utils/assessmentTypes';
import { Json } from '@/integrations/supabase/types';

/**
 * Normalizes categories to ensure consistent format for database
 */
const normalizeCategories = (categories: Category[]): Category[] => {
  console.log("saveAssessment - Beginning categories normalization");
  
  try {
    if (!categories || !Array.isArray(categories)) {
      console.error("saveAssessment - Categories is not an array or is null/undefined");
      return [];
    }
    
    // Deep clone to avoid modifying original data
    const normalizedCategories = JSON.parse(JSON.stringify(categories));
    
    // Process each category
    return normalizedCategories.map((category: any) => {
      if (!category || typeof category !== 'object') {
        console.warn("saveAssessment - Invalid category object:", category);
        return null;
      }
      
      // Ensure category has required fields
      const normalizedCategory = {
        id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
        title: category.title || 'Unknown Category',
        description: category.description || '',
        skills: []
      };
      
      // Process skills if they exist
      if (category.skills && Array.isArray(category.skills)) {
        normalizedCategory.skills = category.skills.map((skill: any) => {
          if (!skill || typeof skill !== 'object') {
            console.warn("saveAssessment - Invalid skill object:", skill);
            return null;
          }
          
          // Normalize skill data
          const normalizedSkill = {
            id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
            name: skill.name || 'Unknown Skill',
            description: skill.description || '',
            ratings: {
              current: 0,
              desired: 0
            }
          };
          
          // Parse ratings
          if (skill.ratings) {
            const current = typeof skill.ratings.current === 'number' 
              ? skill.ratings.current 
              : parseFloat(String(skill.ratings.current || '0'));
              
            const desired = typeof skill.ratings.desired === 'number' 
              ? skill.ratings.desired 
              : parseFloat(String(skill.ratings.desired || '0'));
            
            normalizedSkill.ratings.current = isNaN(current) ? 0 : current;
            normalizedSkill.ratings.desired = isNaN(desired) ? 0 : desired;
          }
          
          return normalizedSkill;
        }).filter(Boolean);
      }
      
      return normalizedCategory;
    }).filter(Boolean);
  } catch (error) {
    console.error("Error normalizing categories:", error);
    return [];
  }
};

/**
 * Validates if categories have any actual ratings data
 */
const hasValidRatings = (categories: Category[]): boolean => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return false;
  }
  
  return categories.some(category => 
    category && category.skills && Array.isArray(category.skills) &&
    category.skills.some(skill => {
      if (!skill || !skill.ratings) return false;
      
      const current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : parseFloat(String(skill.ratings.current || '0'));
        
      const desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : parseFloat(String(skill.ratings.desired || '0'));
      
      return !isNaN(current) && !isNaN(desired) && (current > 0 || desired > 0);
    })
  );
};

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
      console.error('saveAssessment - User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    console.log('saveAssessment - Original categories:', JSON.stringify(categories));
    
    // Normalize the categories to ensure consistent format
    const normalizedCategories = normalizeCategories(categories);
    console.log('saveAssessment - Normalized categories:', JSON.stringify(normalizedCategories));
    
    // Check if the categories have valid ratings before saving
    if (!hasValidRatings(normalizedCategories)) {
      console.error('saveAssessment - No valid ratings found in categories');
      return { success: false, error: 'No valid ratings found in assessment data' };
    }
    
    // Get the current date in YYYY-MM-DD format to check for existing assessments today
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = today + 'T00:00:00Z';
    const endOfDay = today + 'T23:59:59Z';
    
    console.log(`saveAssessment - Checking for assessments between ${startOfDay} and ${endOfDay}`);
    
    // Check if the user already has an assessment from today
    const { data: todaysAssessments, error: checkError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .limit(1);
      
    if (checkError) {
      console.error('saveAssessment - Error checking today\'s assessments:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // If there's already an assessment from today, update it instead of creating a new one
    if (todaysAssessments && todaysAssessments.length > 0) {
      console.log('saveAssessment - Found existing assessment from today, updating it:', todaysAssessments[0].id);
      return await updateExistingAssessment(todaysAssessments[0].id, normalizedCategories, demographics);
    }
    
    // Check for any incomplete assessment
    const { data: incompleteAssessments, error: incompleteCheckError } = await supabase
      .from('assessment_results')
      .select('id')
      .eq('user_id', user.id)
      .is('completed', null)
      .limit(1);
      
    if (incompleteCheckError) {
      console.error('saveAssessment - Error checking incomplete assessments:', incompleteCheckError);
      return { success: false, error: incompleteCheckError.message };
    }
    
    // If there's an incomplete assessment, update it
    if (incompleteAssessments && incompleteAssessments.length > 0) {
      console.log('saveAssessment - Found incomplete assessment, updating it:', incompleteAssessments[0].id);
      return await updateExistingAssessment(incompleteAssessments[0].id, normalizedCategories, demographics);
    }
    
    // If there's no assessment from today and no incomplete assessment, create a new one
    console.log('saveAssessment - No existing assessment found, creating new one');
    return await createNewAssessment(user.id, normalizedCategories, demographics);
  } catch (error) {
    console.error('Error in saveAssessmentResults:', error);
    return { success: false, error: 'Failed to save assessment results' };
  }
};

/**
 * Updates an existing assessment in the database
 * @param assessmentId The ID of the assessment to update
 * @param categories The updated categories data
 * @param demographics The updated demographics data
 * @returns A success or error message
 */
const updateExistingAssessment = async (
  assessmentId: string, 
  categories: Category[], 
  demographics: Demographics
) => {
  console.log('updateExistingAssessment - Updating with categories:', JSON.stringify(categories));
  
  const { data, error } = await supabase
    .from('assessment_results')
    .update({
      categories: categories as unknown as Json,
      demographics: demographics as unknown as Json,
      completed: true
    })
    .eq('id', assessmentId)
    .select();
    
  if (error) {
    console.error('updateExistingAssessment - Error:', error);
    return { success: false, error: error.message };
  }
  
  console.log('updateExistingAssessment - Success, data:', data);
  return { success: true, data };
};

/**
 * Creates a new assessment in the database
 * @param userId The ID of the user creating the assessment
 * @param categories The categories data
 * @param demographics The demographics data
 * @returns A success or error message
 */
const createNewAssessment = async (
  userId: string,
  categories: Category[],
  demographics: Demographics
) => {
  console.log('createNewAssessment - Creating with categories:', JSON.stringify(categories));
  
  // Use insert with onConflict strategy to prevent duplicates at the database level
  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      categories: categories as unknown as Json,
      demographics: demographics as unknown as Json,
      user_id: userId,
      completed: true
    })
    .select();

  if (error) {
    console.error('createNewAssessment - Error:', error);
    return { success: false, error: error.message };
  }

  console.log('createNewAssessment - Success, data:', data);
  return { success: true, data };
};

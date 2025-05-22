
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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

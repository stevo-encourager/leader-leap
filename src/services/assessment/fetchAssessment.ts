
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Category } from '@/utils/assessmentTypes';

/**
 * Retrieves the latest assessment results for the logged-in user
 * @returns An array of categories with their respective scores, or null if no results are found
 */
export const getLatestAssessmentResults = async () => {
  try {
    console.log("getLatestAssessmentResults - Starting fetch of latest assessment");
    
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("getLatestAssessmentResults - User not authenticated");
      return { success: false, error: 'User not authenticated' };
    }
    
    console.log("getLatestAssessmentResults - Fetching for user ID:", user.id);
    
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
      console.log("getLatestAssessmentResults - No assessments found for user");
      return { success: false, data: null };
    }

    // Log details of the retrieved assessment
    console.log("getLatestAssessmentResults - Found assessment:", JSON.stringify({
      id: assessments[0].id,
      created_at: assessments[0].created_at,
      categoriesType: typeof assessments[0].categories,
      categoriesProvided: !!assessments[0].categories,
      categoriesIsArray: Array.isArray(assessments[0].categories),
      categoriesLength: Array.isArray(assessments[0].categories) 
        ? assessments[0].categories.length 
        : (typeof assessments[0].categories === 'object' && assessments[0].categories !== null)
          ? Object.keys(assessments[0].categories).length
          : 0
    }));
    
    // If categories exist, log a sample
    if (assessments[0].categories) {
      try {
        // Handle different possible formats
        let categoriesArray: any;
        
        if (Array.isArray(assessments[0].categories)) {
          categoriesArray = assessments[0].categories;
        } else if (typeof assessments[0].categories === 'string') {
          categoriesArray = JSON.parse(assessments[0].categories);
        } else if (typeof assessments[0].categories === 'object') {
          categoriesArray = Object.values(assessments[0].categories);
        } else {
          categoriesArray = [];
        }
        
        if (categoriesArray.length > 0) {
          const sampleCategory = categoriesArray[0];
          console.log("getLatestAssessmentResults - First category:", JSON.stringify({
            title: sampleCategory.title,
            skillsCount: sampleCategory.skills?.length || 0,
            firstSkill: sampleCategory.skills && sampleCategory.skills.length > 0 
              ? {
                  name: sampleCategory.skills[0].name,
                  ratings: sampleCategory.skills[0].ratings
                }
              : null
          }));
        }
      } catch (e) {
        console.error("getLatestAssessmentResults - Error parsing categories sample:", e);
      }
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
    
    console.log('getAssessmentById - Raw data retrieved:', JSON.stringify({
      id: assessment.id,
      created_at: assessment.created_at,
      categoriesType: typeof assessment.categories,
      categoriesProvided: !!assessment.categories,
      categoriesIsArray: Array.isArray(assessment.categories),
      demographicsProvided: !!assessment.demographics
    }));
    
    // Fix any potential issues with the data format
    if (assessment && assessment.categories) {
      let categoriesData: any = assessment.categories;
      
      // Handle case where categories might be stored as a string
      if (typeof categoriesData === 'string') {
        try {
          categoriesData = JSON.parse(categoriesData);
          console.log('getAssessmentById - Parsed categories from string:', JSON.stringify({
            parsed: true,
            length: Array.isArray(categoriesData) ? categoriesData.length : 0,
            isArray: Array.isArray(categoriesData)
          }));
        } catch (e) {
          console.error('getAssessmentById - Failed to parse categories string:', e);
        }
      }
      
      // Ensure we have an array to work with
      if (!Array.isArray(categoriesData)) {
        console.log('getAssessmentById - Categories is not an array, attempting to convert');
        if (typeof categoriesData === 'object' && categoriesData !== null) {
          categoriesData = Object.values(categoriesData);
          console.log('getAssessmentById - Converted object to array, length:', categoriesData.length);
        } else {
          console.error('getAssessmentById - Could not convert categories to array');
          categoriesData = [];
        }
      }
      
      // Count ratings before fixing
      const beforeCounts = {
        categories: categoriesData.length,
        totalSkills: 0,
        skillsWithRatings: 0
      };
      
      categoriesData.forEach((cat: any) => {
        if (cat && cat.skills && Array.isArray(cat.skills)) {
          beforeCounts.totalSkills += cat.skills.length;
          cat.skills.forEach((skill: any) => {
            if (skill && skill.ratings && 
               (typeof skill.ratings.current === 'number' || 
                typeof skill.ratings.desired === 'number')) {
              beforeCounts.skillsWithRatings++;
            }
          });
        }
      });
      
      console.log('getAssessmentById - Before fixing, found:', JSON.stringify(beforeCounts));
      
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
      
      // Count ratings after fixing
      const afterCounts = {
        categories: fixedCategories.length,
        totalSkills: 0,
        skillsWithRatings: 0
      };
      
      fixedCategories.forEach((cat: Category) => {
        if (cat && cat.skills && Array.isArray(cat.skills)) {
          afterCounts.totalSkills += cat.skills.length;
          cat.skills.forEach(skill => {
            if (skill && skill.ratings && 
               (typeof skill.ratings.current === 'number' || 
                typeof skill.ratings.desired === 'number')) {
              afterCounts.skillsWithRatings++;
            }
          });
        }
      });
      
      console.log('getAssessmentById - After fixing, found:', JSON.stringify(afterCounts));

      assessment.categories = fixedCategories as unknown as Json;
      
      // Log sample of fixed data
      if (fixedCategories.length > 0 && fixedCategories[0].skills && fixedCategories[0].skills.length > 0) {
        console.log('getAssessmentById - Sample of fixed data:', JSON.stringify({
          categoryTitle: fixedCategories[0].title,
          skillCount: fixedCategories[0].skills.length,
          firstSkill: {
            name: fixedCategories[0].skills[0].name,
            ratings: fixedCategories[0].skills[0].ratings
          }
        }));
      }
    }

    return { success: true, data: assessment };
  } catch (error) {
    console.error('getAssessmentById - Error:', error);
    return { success: false, error: 'Failed to fetch assessment by ID' };
  }
};

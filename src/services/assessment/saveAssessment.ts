
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData } from './manageAssessmentHistory';
import { v4 as uuidv4 } from 'uuid';

export interface SaveAssessmentResult {
  success: boolean;
  error?: string;
  data?: any;
  isUpdate?: boolean; // Flag to indicate if this was an update vs new insert
}

// Helper function to generate a deterministic assessment signature
const generateAssessmentSignature = (categories: Category[], demographics: Demographics): string => {
  // Create a signature based on the assessment content
  const categorySignature = categories.map(cat => 
    cat.skills.map(skill => `${skill.id}-${skill.ratings.current}-${skill.ratings.desired}`).join('|')
  ).join('||');
  
  const demoSignature = `${demographics.role || ''}-${demographics.industry || ''}-${demographics.yearsOfExperience || ''}`;
  
  return `${categorySignature}::${demoSignature}`;
};

// Check if an assessment with the same content already exists for this user
const checkForDuplicateAssessment = async (
  userId: string, 
  assessmentSignature: string
): Promise<{ exists: boolean; assessmentId?: string }> => {
  
  
  // Check for assessments created in the last 24 hours to avoid checking too far back
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { data: recentAssessments, error } = await supabase
    .from('assessment_results')
    .select('id, categories, demographics, created_at')
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return { exists: false };
  }

      if (!recentAssessments || recentAssessments.length === 0) {
      return { exists: false };
    }

  // Check each recent assessment to see if it has the same signature
  for (const assessment of recentAssessments) {
    try {
      // Safely parse the categories and demographics from the database
      let assessmentCategories: Category[] = [];
      let assessmentDemographics: Demographics = {};
      
      // Handle categories - convert from Supabase Json type
      if (typeof assessment.categories === 'string') {
        assessmentCategories = JSON.parse(assessment.categories);
      } else if (Array.isArray(assessment.categories)) {
        // Safely convert from Json[] to Category[] through unknown
        assessmentCategories = assessment.categories as unknown as Category[];
      }
      
      // Handle demographics - convert from Supabase Json type
      if (typeof assessment.demographics === 'string') {
        assessmentDemographics = JSON.parse(assessment.demographics);
      } else if (assessment.demographics && typeof assessment.demographics === 'object') {
        // Safely convert from Json to Demographics through unknown
        assessmentDemographics = assessment.demographics as unknown as Demographics;
      }
      
      const existingSignature = generateAssessmentSignature(
        assessmentCategories, 
        assessmentDemographics
      );
      
      if (existingSignature === assessmentSignature) {
        return { exists: true, assessmentId: assessment.id };
      }
    } catch (error) {
      continue;
    }
  }

  return { exists: false };
};

export const TEST_ASSESSMENT_ID = '08a5f01a-db17-474d-a3e8-c53bedbc34c8';

export const saveAssessmentResults = async (
  categories: Category[], 
  demographics: Demographics,
  forceNew: boolean = false, // Allow forcing a new assessment if needed
  assessmentId?: string, // Optionally pass the assessmentId for test assessment updates
  overrideUserId?: string // Optionally pass a user_id (for anonymous/temporary users)
): Promise<SaveAssessmentResult> => {
  
  // Validate input data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return { success: false, error: "Invalid categories data" };
  }

  // Count and validate skills with ratings
  let totalSkills = 0;
  let skillsWithBothRatings = 0;
  
  console.log('saveAssessmentResults - Validating categories:', categories.length);
  
  categories.forEach((category, categoryIndex) => {
    if (category && category.skills && Array.isArray(category.skills)) {
      console.log(`saveAssessmentResults - Category ${categoryIndex}:`, category.title, 'skills:', category.skills.length);
      
      category.skills.forEach((skill, skillIndex) => {
        totalSkills++;
        
        if (skill && skill.ratings) {
          const currentRating = Number(skill.ratings.current) || 0;
          const desiredRating = Number(skill.ratings.desired) || 0;
          
          console.log(`saveAssessmentResults - Skill ${skillIndex}:`, skill.name, 'current:', currentRating, 'desired:', desiredRating);
          
          if (currentRating > 0 && desiredRating > 0) {
            skillsWithBothRatings++;
          }
        } else {
          console.log(`saveAssessmentResults - Skill ${skillIndex}:`, skill.name, 'NO RATINGS');
        }
      });
    } else {
      console.log(`saveAssessmentResults - Category ${categoryIndex}: Invalid category or skills`);
    }
  });
  
  console.log('saveAssessmentResults - Validation results:', { totalSkills, skillsWithBothRatings, isComplete: totalSkills > 0 && skillsWithBothRatings === totalSkills });

  // Check if the assessment is complete (all skills have both ratings)
  const isComplete = totalSkills > 0 && skillsWithBothRatings === totalSkills;
  
  if (!isComplete) {
    // ADD ALERT FOR TESTING
    alert(`Assessment incomplete: ${totalSkills} total skills, ${skillsWithBothRatings} with both ratings`);
    return { success: false, error: "Assessment is incomplete. All skills must be rated." };
  }

  // Always store locally first as a backup
  try {
    storeLocalAssessmentData(categories, demographics);
  } catch (localError) {
    // Silent fail for local storage
  }

  // Check if user is authenticated
  let user = null;
  let authError = null;
  let userId = overrideUserId;
  try {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
    authError = authResult.error;
    if (user && user.id) {
      userId = user.id;
    }
  } catch (error) {
    authError = error;
  }
  // If no userId, generate a temporary one and store in localStorage
  if (!userId) {
    userId = localStorage.getItem('temp_user_id') || uuidv4();
    localStorage.setItem('temp_user_id', userId);
  }

  try {
    // Prepare the data to save - ensure all ratings are properly formatted
    const processedCategories = categories.map(category => ({
      ...category,
      skills: category.skills.map(skill => ({
        ...skill,
        ratings: {
          current: Number(skill.ratings.current) || 0,
          desired: Number(skill.ratings.desired) || 0
        }
      }))
    }));

    // Convert Demographics to a regular object to satisfy TypeScript
    const demographicsObject = { ...demographics };

    // --- TEST ASSESSMENT SPECIAL CASE ---
    if (assessmentId === TEST_ASSESSMENT_ID) {
      // Update the test assessment and reset ai_insights
      const result = await supabase
        .from('assessment_results')
        .update({
          categories: processedCategories,
          demographics: demographicsObject,
          completed: isComplete,
          ai_insights: null // Always reset for test assessment
        })
        .eq('id', TEST_ASSESSMENT_ID)
        .eq('user_id', user.id)
        .select();
      if (result.data) {
        return { success: true, data: result.data, isUpdate: true };
      } else {
        return { success: false, error: "Failed to update test assessment" };
      }
    }

    // --- ALL OTHER ASSESSMENTS: Always create new record ---
    console.log('saveAssessmentResults - Creating new assessment record for user:', userId);
    const result = await supabase
      .from('assessment_results')
      .insert({
        user_id: userId,
        categories: processedCategories,
        demographics: demographicsObject,
        completed: isComplete,
        ai_insights: null // Will be generated once on first access
      })
      .select();

    const { data, error } = result;
    console.log('saveAssessmentResults - Insert result:', { data, error });

    if (error) {
      console.log('saveAssessmentResults - Database error:', error);
      return { success: false, error: error.message };
    }

    console.log('saveAssessmentResults - Successfully saved assessment:', data);
    return { success: true, data, isUpdate: false };

  } catch (error) {
    return { success: false, error: "An unexpected error occurred while saving" };
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData } from './manageAssessmentHistory';

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
  console.log("checkForDuplicateAssessment - Checking for duplicate with signature:", assessmentSignature.substring(0, 100) + "...");
  
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
    console.error("checkForDuplicateAssessment - Error checking for duplicates:", error);
    return { exists: false };
  }

  if (!recentAssessments || recentAssessments.length === 0) {
    console.log("checkForDuplicateAssessment - No recent assessments found");
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
        console.log("checkForDuplicateAssessment - Found duplicate assessment:", assessment.id);
        return { exists: true, assessmentId: assessment.id };
      }
    } catch (error) {
      console.error("checkForDuplicateAssessment - Error comparing assessment:", error);
      continue;
    }
  }

  console.log("checkForDuplicateAssessment - No duplicate found among recent assessments");
  return { exists: false };
};

export const TEST_ASSESSMENT_ID = '2631edf1-a358-4303-83c1-deb9664b53e2';

export const saveAssessmentResults = async (
  categories: Category[], 
  demographics: Demographics,
  forceNew: boolean = false, // Allow forcing a new assessment if needed
  assessmentId?: string // Optionally pass the assessmentId for test assessment updates
): Promise<SaveAssessmentResult> => {
  console.log("saveAssessmentResults - Starting save process");
  console.log("saveAssessmentResults - Categories input:", categories ? `${categories.length} categories` : "none");
  console.log("saveAssessmentResults - Force new assessment:", forceNew);
  
  // Validate input data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.error("saveAssessmentResults - Invalid categories data:", categories);
    return { success: false, error: "Invalid categories data" };
  }

  // Count and validate skills with ratings
  let totalSkills = 0;
  let skillsWithBothRatings = 0;
  
  categories.forEach(category => {
    if (category && category.skills && Array.isArray(category.skills)) {
      category.skills.forEach(skill => {
        totalSkills++;
        if (skill && skill.ratings) {
          const currentRating = Number(skill.ratings.current) || 0;
          const desiredRating = Number(skill.ratings.desired) || 0;
          
          if (currentRating > 0 && desiredRating > 0) {
            skillsWithBothRatings++;
          }
        }
      });
    }
  });

  console.log(`saveAssessmentResults - Found ${skillsWithBothRatings}/${totalSkills} skills with complete ratings`);

  // Check if the assessment is complete (all skills have both ratings)
  const isComplete = totalSkills > 0 && skillsWithBothRatings === totalSkills;
  
  if (!isComplete) {
    console.error("saveAssessmentResults - Assessment is incomplete");
    return { success: false, error: "Assessment is incomplete. All skills must be rated." };
  }

  // Always store locally first as a backup
  try {
    storeLocalAssessmentData(categories, demographics);
    console.log("saveAssessmentResults - Successfully stored data locally");
  } catch (localError) {
    console.error("saveAssessmentResults - Error storing locally:", localError);
  }

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error("saveAssessmentResults - Auth error:", authError);
    return { success: false, error: "Authentication error" };
  }

  if (!user) {
    console.log("saveAssessmentResults - No authenticated user, saving to local storage only");
    return { success: true, data: [] }; // Return success for local storage save
  }

  try {
    console.log(`saveAssessmentResults - Saving to database for user: ${user.id}`);
    
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
        console.log("saveAssessmentResults - Updated test assessment");
        return { success: true, data: result.data, isUpdate: true };
      } else {
        console.error("saveAssessmentResults - Failed to update test assessment");
        return { success: false, error: "Failed to update test assessment" };
      }
    }

    // --- ALL OTHER ASSESSMENTS: Always create new record ---
    const result = await supabase
      .from('assessment_results')
      .insert({
        user_id: user.id,
        categories: processedCategories,
        demographics: demographicsObject,
        completed: isComplete,
        ai_insights: null // Will be generated once on first access
      })
      .select();

    const { data, error } = result;

    if (error) {
      console.error("saveAssessmentResults - Database error:", error);
      return { success: false, error: error.message };
    }

    console.log("saveAssessmentResults - Successfully saved to database:", data);
    return { success: true, data, isUpdate: false };

  } catch (error) {
    console.error("saveAssessmentResults - Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred while saving" };
  }
};

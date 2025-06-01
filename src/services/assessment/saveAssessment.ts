
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData } from './manageAssessmentHistory';

export interface SaveAssessmentResult {
  success: boolean;
  error?: string;
  data?: any;
  isExisting?: boolean; // Flag to indicate if we updated an existing record
}

// Generate a session-based key for tracking assessment attempts
const generateSessionKey = (): string => {
  // Use a combination of timestamp and random string for uniqueness
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `assessment_${timestamp}_${random}`;
};

// Get or create a session key for this assessment attempt
const getAssessmentSessionKey = (): string => {
  const storageKey = 'current_assessment_session';
  let sessionKey = sessionStorage.getItem(storageKey);
  
  if (!sessionKey) {
    sessionKey = generateSessionKey();
    sessionStorage.setItem(storageKey, sessionKey);
    console.log('Generated new assessment session key:', sessionKey);
  } else {
    console.log('Using existing assessment session key:', sessionKey);
  }
  
  return sessionKey;
};

// Clear the session key when starting a new assessment
export const clearAssessmentSession = (): void => {
  sessionStorage.removeItem('current_assessment_session');
  console.log('Cleared assessment session key');
};

export const saveAssessmentResults = async (
  categories: Category[], 
  demographics: Demographics
): Promise<SaveAssessmentResult> => {
  console.log("saveAssessmentResults - Starting save process");
  console.log("saveAssessmentResults - Categories input:", categories ? `${categories.length} categories` : "none");
  
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
    
    // Get session key for this assessment attempt
    const sessionKey = getAssessmentSessionKey();
    
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

    // Convert Demographics to a regular object and add session key
    const demographicsObject = { 
      ...demographics,
      sessionKey // Add session key to track this specific assessment attempt
    };

    // First, check if we already have an assessment for this session
    console.log("saveAssessmentResults - Checking for existing assessment with session key:", sessionKey);
    
    const { data: existingAssessment, error: fetchError } = await supabase
      .from('assessment_results')
      .select('id, created_at, demographics')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10); // Check recent assessments

    if (fetchError) {
      console.error("saveAssessmentResults - Error checking for existing assessments:", fetchError);
      // Continue with insert if we can't check for existing
    }

    let existingRecord = null;
    
    // Look for an assessment with matching session key
    if (existingAssessment && existingAssessment.length > 0) {
      existingRecord = existingAssessment.find(assessment => {
        // Type-safe check for sessionKey in demographics
        if (assessment.demographics && typeof assessment.demographics === 'object' && !Array.isArray(assessment.demographics)) {
          const demographicsObj = assessment.demographics as Record<string, any>;
          return demographicsObj.sessionKey === sessionKey;
        }
        return false;
      });
      
      if (existingRecord) {
        console.log(`saveAssessmentResults - Found existing assessment with session key: ${existingRecord.id}`);
      } else {
        // Also check for very recent assessments (within last 2 minutes) without session key
        // This handles assessments created before the session key system
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const recentRecord = existingAssessment.find(assessment => 
          new Date(assessment.created_at) > twoMinutesAgo
        );
        
        if (recentRecord) {
          console.log(`saveAssessmentResults - Found recent assessment within 2 minutes: ${recentRecord.id}`);
          existingRecord = recentRecord;
        }
      }
    }

    let result;

    if (existingRecord) {
      // Update the existing assessment
      console.log(`saveAssessmentResults - Updating existing assessment: ${existingRecord.id}`);
      
      result = await supabase
        .from('assessment_results')
        .update({
          categories: processedCategories,
          demographics: demographicsObject,
          completed: isComplete,
          ai_insights: null // Reset insights when updating assessment data
        })
        .eq('id', existingRecord.id)
        .eq('user_id', user.id)
        .select();
        
      if (result.data && result.data.length > 0) {
        console.log("saveAssessmentResults - Successfully updated existing assessment");
        return { success: true, data: result.data, isExisting: true };
      }
    } else {
      // Create new assessment only if no existing one found
      console.log("saveAssessmentResults - Creating new assessment (no existing assessment found)");
      result = await supabase
        .from('assessment_results')
        .insert({
          user_id: user.id,
          categories: processedCategories,
          demographics: demographicsObject,
          completed: isComplete,
          ai_insights: null // Initialize as null, will be populated when first accessed
        })
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error("saveAssessmentResults - Database error:", error);
      return { success: false, error: error.message };
    }

    console.log("saveAssessmentResults - Successfully saved to database:", data);
    return { success: true, data, isExisting: !!existingRecord };

  } catch (error) {
    console.error("saveAssessmentResults - Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred while saving" };
  }
};

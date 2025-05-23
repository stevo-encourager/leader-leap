
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData } from './manageAssessmentHistory';

export interface SaveAssessmentResult {
  success: boolean;
  error?: string;
  data?: any;
}

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
  let skillsWithRatings = 0;
  let totalRatingValues = 0;
  
  categories.forEach(category => {
    if (category && category.skills && Array.isArray(category.skills)) {
      category.skills.forEach(skill => {
        if (skill && skill.ratings) {
          const currentRating = Number(skill.ratings.current) || 0;
          const desiredRating = Number(skill.ratings.desired) || 0;
          
          if (currentRating > 0 || desiredRating > 0) {
            skillsWithRatings++;
            totalRatingValues += (currentRating > 0 ? 1 : 0) + (desiredRating > 0 ? 1 : 0);
          }
        }
      });
    }
  });

  console.log(`saveAssessmentResults - Found ${skillsWithRatings} skills with ratings (${totalRatingValues} total rating values)`);

  if (skillsWithRatings === 0) {
    console.error("saveAssessmentResults - No skills with valid ratings found");
    return { success: false, error: "No valid assessment ratings found to save" };
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

    // Use a more robust approach to prevent duplicates
    // Create a unique constraint based on user_id and a time window
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    
    console.log("saveAssessmentResults - Checking for recent assessments within 5 minutes");
    
    // Check for any assessment created in the last 5 minutes
    const { data: recentAssessments, error: fetchError } = await supabase
      .from('assessment_results')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("saveAssessmentResults - Error checking for recent assessments:", fetchError);
      // Continue with insert if we can't check for duplicates
    }

    let result;

    if (recentAssessments && recentAssessments.length > 0) {
      // Update the most recent assessment instead of creating a new one
      const recentAssessment = recentAssessments[0];
      console.log(`saveAssessmentResults - Updating recent assessment: ${recentAssessment.id} (created at: ${recentAssessment.created_at})`);
      
      result = await supabase
        .from('assessment_results')
        .update({
          categories: processedCategories,
          demographics: demographicsObject,
          completed: true
        })
        .eq('id', recentAssessment.id)
        .eq('user_id', user.id)
        .select();
    } else {
      // Create new assessment only if no recent one exists
      console.log("saveAssessmentResults - Creating new assessment (no recent assessments found)");
      result = await supabase
        .from('assessment_results')
        .insert({
          user_id: user.id,
          categories: processedCategories,
          demographics: demographicsObject,
          completed: true
        })
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error("saveAssessmentResults - Database error:", error);
      return { success: false, error: error.message };
    }

    console.log("saveAssessmentResults - Successfully saved to database:", data);
    return { success: true, data };

  } catch (error) {
    console.error("saveAssessmentResults - Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred while saving" };
  }
};

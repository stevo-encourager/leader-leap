import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData } from './manageAssessmentHistory';
import { v4 as uuidv4 } from 'uuid';

// Define the return type for save operations
interface SaveAssessmentResult {
  success: boolean;
  error?: string;
  data?: any;
  isUpdate?: boolean;
}

export const TEST_ASSESSMENT_ID = '2631edf1-a358-4303-83c1-deb9664b53e2';

const generateAssessmentSignature = (categories: Category[], demographics: Demographics): string => {
  // Create a simple signature based on assessment content
  const categorySignature = categories.map(cat => 
    cat.skills.map(skill => `${skill.id}:${skill.ratings?.current || 0}:${skill.ratings?.desired || 0}`).join(',')
  ).join('|');
  
  const demoSignature = `${demographics.role || ''}:${demographics.industry || ''}:${demographics.teamSize || ''}`;
  
  return `${categorySignature}:${demoSignature}`;
};

const checkForDuplicateAssessment = async (
  userId: string, 
  assessmentSignature: string
): Promise<{ exists: boolean; assessmentId?: string }> => {
  try {
    // Check for assessments within the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('assessment_results')
      .select('id, categories, demographics, created_at')
      .eq('user_id', userId)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking for duplicate assessments:', error);
      return { exists: false };
    }

    if (!data || data.length === 0) {
      return { exists: false };
    }

    // Check if any existing assessment has the same signature
    for (const assessment of data) {
      const existingSignature = generateAssessmentSignature(
        (assessment as any).categories as Category[],
        (assessment as any).demographics as Demographics
      );
      
      if (existingSignature === assessmentSignature) {
        return { exists: true, assessmentId: (assessment as any).id };
      }
    }

    return { exists: false };
  } catch (error) {
    console.error('Error in duplicate check:', error);
    return { exists: false };
  }
};

/**
 * Save assessment results to Supabase
 * Includes validation, local storage backup, and duplicate checking
 */
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
  let skillsWithPartialRatings = 0;
  let skillsWithNoRatings = 0;
  
  console.log('saveAssessmentResults - Validating categories:', categories.length);
  
  categories.forEach((category, categoryIndex) => {
    if (category && category.skills && Array.isArray(category.skills)) {
      console.log(`saveAssessmentResults - Category ${categoryIndex}:`, category.title, 'skills:', category.skills.length);
      
      category.skills.forEach((skill, skillIndex) => {
        totalSkills++;
        
        if (skill && skill.ratings) {
          const currentRating = Number(skill.ratings.current) || 0;
          const desiredRating = Number(skill.ratings.desired) || 0;
          const hasCurrentRating = currentRating > 0;
          const hasDesiredRating = desiredRating > 0;
          
          console.log(`saveAssessmentResults - Skill ${skillIndex}:`, skill.name, 'current:', currentRating, 'desired:', desiredRating);
          
          if (currentRating > 0 && desiredRating > 0) {
            skillsWithBothRatings++;
          } else if (hasCurrentRating || hasDesiredRating) {
            skillsWithPartialRatings++;
          } else {
            skillsWithNoRatings++;
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

  const isComplete = skillsWithBothRatings === totalSkills && totalSkills > 0;

  if (!isComplete) {
    console.log('saveAssessmentResults - Assessment incomplete:', { totalSkills, skillsWithBothRatings });
    return { success: false, error: "Assessment is incomplete. All skills must be rated." };
  }

  // Always store locally first as a backup
  try {
    storeLocalAssessmentData(categories, demographics);
  } catch (localError) {
    // Silent fail for local storage
  }

  // Check if user is authenticated and ensure session is valid
  let user = null;
  let authError = null;
  let userId = overrideUserId;
  try {
    // Get the current session to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      authError = sessionError;
    } else if (session?.user) {
      user = session.user;
      userId = session.user.id;
      
      // Verify the session is still valid by checking with the server
      const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !verifiedUser) {
        authError = userError || new Error('Session verification failed');
        user = null;
        userId = overrideUserId;
      }
    }
  } catch (error) {
    authError = error;
  }
  
  const isAuthenticatedUser = !!user;
  
  // If no userId, generate a temporary one and store in localStorage
  if (!userId) {
    userId = localStorage.getItem('temp_user_id') || uuidv4();
    localStorage.setItem('temp_user_id', userId);
  }

  try {

    // Special case: Handle update for test assessment
    if (assessmentId === '2631edf1-a358-4303-83c1-deb9664b53e2') {
      // This is the public test assessment, update it
      const { data: updateData, error: updateError } = await supabase
        .from('assessment_results')
        .update({
          categories: categories as any,
          demographics: demographics as any,
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select();

      if (updateError) {
        console.error('Error updating test assessment:', updateError);
        return { success: false, error: `Failed to update assessment: ${updateError.message}` };
      }

      console.log('Test assessment updated successfully:', updateData);
      return { 
        success: true, 
        data: updateData?.[0], 
        isUpdate: true 
      };
    }

    // Handle update for specific assessment ID
    if (assessmentId && !forceNew && user) {
      const { data: updateData, error: updateError } = await supabase
        .from('assessment_results')
        .update({
          categories: categories as any,
          demographics: demographics as any,
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .eq('user_id', user.id)
        .select();

      if (updateError) {
        console.error('Error updating assessment:', updateError);
        return { success: false, error: `Failed to update assessment: ${updateError.message}` };
      }

      console.log('Assessment updated successfully:', updateData);
      return { 
        success: true, 
        data: updateData?.[0], 
        isUpdate: true 
      };
    }

    // Check for duplicate assessment within last 24 hours (only for authenticated users)
    if (!forceNew && isAuthenticatedUser && user) {
      const assessmentSignature = generateAssessmentSignature(categories, demographics);
      const duplicateCheck = await checkForDuplicateAssessment(user.id, assessmentSignature);
      
      if (duplicateCheck.exists) {
        return { 
          success: false, 
          error: "You have already submitted an identical assessment within the last 24 hours." 
        };
      }
    }

    // --- ALL OTHER ASSESSMENTS: Always create new record ---
    console.log('saveAssessmentResults - Creating new assessment record for user:', userId);
    const result = await supabase
      .from('assessment_results')
      .insert({
        user_id: userId,
        categories: categories as any,
        demographics: demographics as any,
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

  } catch (error: any) {
    console.error('Unexpected error in saveAssessmentResults:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
};
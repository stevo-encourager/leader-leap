import { supabase } from '@/integrations/supabase/client';
import { normalizeCategories, normalizeDemographics } from '@/utils/dataNormalizer';
import { Category, Demographics } from '@/utils/assessmentTypes';

// Define AssessmentResult type
interface AssessmentResult {
  id: string;
  categories: Category[];
  demographics: Demographics;
  created_at: string | null;
  completed: boolean | null;
}

/**
 * Fetch a specific assessment by ID
 */
export const fetchAssessmentById = async (assessmentId: string): Promise<{
  success: boolean;
  data?: AssessmentResult;
  error?: string;
}> => {
  try {
    if (!assessmentId || typeof assessmentId !== 'string') {
      return { success: false, error: "Invalid assessment ID" };
    }

    console.log(`Assessment Service: Fetching assessment ${assessmentId}`);
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', assessmentId)
      .maybeSingle();

    if (error) {
      console.error('Assessment Service: Database error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.log('Assessment Service: Assessment not found');
      return { success: false, error: "Assessment not found" };
    }

    // Type assertion after null check
    const assessment = data as any;

    // Validate and normalize the categories data
    const rawCategories = assessment.categories;
    if (!rawCategories || !Array.isArray(rawCategories)) {
      return { success: false, error: "Invalid assessment data format" };
    }

    // Normalize the data to ensure consistent format
    const normalizedCategories = normalizeCategories(rawCategories);
    const normalizedDemographics = normalizeDemographics(assessment.demographics);

    // Validate that we have meaningful data after normalization
    const validCategories = normalizedCategories.filter(cat => 
      cat && cat.skills && cat.skills.length > 0 &&
      cat.skills.some(skill => 
        skill && skill.ratings && 
        (skill.ratings.current > 0 || skill.ratings.desired > 0)
      )
    );

    if (validCategories.length === 0) {
      return { success: false, error: "Assessment contains no valid rating data" };
    }

    const result: AssessmentResult = {
      id: assessment.id,
      categories: validCategories,
      demographics: normalizedDemographics,
      created_at: assessment.created_at,
      completed: assessment.completed
    };

    return { success: true, data: result };

  } catch (error) {
    console.error('Assessment Service: Exception in fetchAssessmentById:', error);
    return { success: false, error: "Failed to fetch assessment" };
  }
};

/**
 * Fetch the latest assessment for a specific user
 */
export const fetchLatestAssessmentByUserId = async (userId: string): Promise<{
  success: boolean;
  data?: AssessmentResult;
  error?: string;
}> => {
  try {
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: "Invalid user ID" };
    }

    console.log(`Assessment Service: Fetching latest assessment for user ${userId}`);
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Assessment Service: Database error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.log('Assessment Service: No assessments found for user');
      return { success: false, error: "No assessments found" };
    }

    // Type assertion after null check
    const assessment = data as any;

    // Validate and normalize the categories data
    const rawCategories = assessment.categories;
    if (!rawCategories || !Array.isArray(rawCategories)) {
      return { success: false, error: "Invalid assessment data format" };
    }

    // Normalize the data to ensure consistent format
    const normalizedCategories = normalizeCategories(rawCategories);
    const normalizedDemographics = normalizeDemographics(assessment.demographics);

    const result: AssessmentResult = {
      id: assessment.id,
      categories: normalizedCategories,
      demographics: normalizedDemographics,
      created_at: assessment.created_at,
      completed: assessment.completed
    };

    return { success: true, data: result };

  } catch (error) {
    console.error('Assessment Service: Exception in fetchLatestAssessmentByUserId:', error);
    return { success: false, error: "Failed to fetch latest assessment" };
  }
};

/**
 * Fetch a specific assessment that belongs to a specific user
 */
export const fetchAssessmentByIdAndUserId = async (assessmentId: string, userId: string): Promise<{
  success: boolean;
  data?: AssessmentResult;
  error?: string;
}> => {
  try {
    if (!assessmentId || typeof assessmentId !== 'string') {
      return { success: false, error: "Invalid assessment ID" };
    }

    if (!userId || typeof userId !== 'string') {
      return { success: false, error: "Invalid user ID" };
    }

    console.log(`Assessment Service: Fetching assessment ${assessmentId} for user ${userId}`);
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)
      .eq('id', assessmentId)
      .maybeSingle();

    if (error) {
      console.error('Assessment Service: Database error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.log('Assessment Service: Assessment not found or does not belong to user');
      return { success: false, error: "Assessment not found" };
    }

    // Type assertion after null check
    const assessment = data as any;

    // Validate and normalize the categories data
    const rawCategories = assessment.categories;
    if (!rawCategories || !Array.isArray(rawCategories)) {
      return { success: false, error: "Invalid assessment data format" };
    }

    // Normalize the data to ensure consistent format
    const normalizedCategories = normalizeCategories(rawCategories);
    const normalizedDemographics = normalizeDemographics(assessment.demographics);

    const result: AssessmentResult = {
      id: assessment.id,
      categories: normalizedCategories,
      demographics: normalizedDemographics,
      created_at: assessment.created_at,
      completed: assessment.completed
    };

    return { success: true, data: result };

  } catch (error) {
    console.error('Assessment Service: Exception in fetchAssessmentByIdAndUserId:', error);
    return { success: false, error: "Failed to fetch assessment" };
  }
};

/**
 * Fetch assessment data for AI insights (minimal data required)
 */
export const fetchAssessmentForInsights = async (assessmentId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    if (!assessmentId || typeof assessmentId !== 'string') {
      return { success: false, error: "Invalid assessment ID" };
    }

    const { data, error } = await supabase
      .from('assessment_results')
      .select('categories, demographics')
      .eq('id', assessmentId)
      .maybeSingle();

    if (error) {
      console.error('Assessment Service: Database error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Assessment not found" };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Assessment Service: Exception in fetchAssessmentForInsights:', error);
    return { success: false, error: "Failed to fetch assessment for insights" };
  }
};

// Legacy exports for backwards compatibility
export const getAssessmentById = fetchAssessmentById;
export const getLatestAssessmentResults = fetchLatestAssessmentByUserId;
export const getSpecificAssessmentResults = fetchAssessmentByIdAndUserId;
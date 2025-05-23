
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { normalizeCategories, normalizeDemographics } from '@/utils/dataNormalizer';

export interface AssessmentResult {
  id: string;
  categories: Category[];
  demographics: Demographics;
  created_at: string;
  completed: boolean;
}

export interface FetchAssessmentResult {
  success: boolean;
  data?: AssessmentResult;
  error?: string;
}

export const getLatestAssessmentResults = async (): Promise<FetchAssessmentResult> => {
  console.log("getLatestAssessmentResults - Starting fetch");
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("getLatestAssessmentResults - Auth error:", authError);
      return { success: false, error: "Authentication error" };
    }

    if (!user) {
      console.log("getLatestAssessmentResults - No authenticated user");
      return { success: false, error: "User not authenticated" };
    }

    console.log(`getLatestAssessmentResults - Fetching for user: ${user.id}`);

    // Fetch the most recent completed assessment
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("getLatestAssessmentResults - Database error:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log("getLatestAssessmentResults - No assessment found for user");
      return { success: false, error: "No assessment found" };
    }

    const assessment = data[0];
    console.log("getLatestAssessmentResults - Raw assessment data:", {
      id: assessment.id,
      categoriesType: typeof assessment.categories,
      categoriesLength: Array.isArray(assessment.categories) ? assessment.categories.length : 'not array',
      demographicsType: typeof assessment.demographics,
      created_at: assessment.created_at
    });

    // Validate and normalize the categories data
    const rawCategories = assessment.categories;
    if (!rawCategories || !Array.isArray(rawCategories)) {
      console.error("getLatestAssessmentResults - Invalid categories data:", rawCategories);
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
      console.error("getLatestAssessmentResults - No valid categories with ratings found");
      return { success: false, error: "Assessment contains no valid rating data" };
    }

    console.log(`getLatestAssessmentResults - Successfully normalized ${validCategories.length} categories with rating data`);

    const result: AssessmentResult = {
      id: assessment.id,
      categories: validCategories,
      demographics: normalizedDemographics,
      created_at: assessment.created_at,
      completed: assessment.completed
    };

    return { success: true, data: result };

  } catch (error) {
    console.error("getLatestAssessmentResults - Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred while fetching assessment" };
  }
};

export const getSpecificAssessmentResults = async (assessmentId: string): Promise<FetchAssessmentResult> => {
  console.log(`getSpecificAssessmentResults - Fetching assessment: ${assessmentId}`);
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("getSpecificAssessmentResults - Auth error:", authError);
      return { success: false, error: "Authentication error" };
    }

    if (!user) {
      console.log("getSpecificAssessmentResults - No authenticated user");
      return { success: false, error: "User not authenticated" };
    }

    // Fetch the specific assessment
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .limit(1);

    if (error) {
      console.error("getSpecificAssessmentResults - Database error:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log("getSpecificAssessmentResults - Assessment not found");
      return { success: false, error: "Assessment not found" };
    }

    const assessment = data[0];
    console.log("getSpecificAssessmentResults - Raw assessment data:", {
      id: assessment.id,
      categoriesType: typeof assessment.categories,
      categoriesLength: Array.isArray(assessment.categories) ? assessment.categories.length : 'not array',
      demographicsType: typeof assessment.demographics
    });

    // Validate and normalize the categories data
    const rawCategories = assessment.categories;
    if (!rawCategories || !Array.isArray(rawCategories)) {
      console.error("getSpecificAssessmentResults - Invalid categories data:", rawCategories);
      return { success: false, error: "Invalid assessment data format" };
    }

    // Normalize the data to ensure consistent format
    const normalizedCategories = normalizeCategories(rawCategories);
    const normalizedDemographics = normalizeDemographics(assessment.demographics);

    console.log(`getSpecificAssessmentResults - Successfully normalized ${normalizedCategories.length} categories`);

    const result: AssessmentResult = {
      id: assessment.id,
      categories: normalizedCategories,
      demographics: normalizedDemographics,
      created_at: assessment.created_at,
      completed: assessment.completed
    };

    return { success: true, data: result };

  } catch (error) {
    console.error("getSpecificAssessmentResults - Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred while fetching assessment" };
  }
};

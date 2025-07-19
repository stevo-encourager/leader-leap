import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { normalizeCategories, normalizeDemographics } from '@/utils/dataNormalizer';
// Force TypeScript refresh for updated Supabase types

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
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, error: "Authentication error" };
    }

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch the most recent completed assessment
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "No assessment found" };
    }

    const assessment = data[0];

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
    return { success: false, error: "An unexpected error occurred while fetching assessment" };
  }
};

// Function to fetch a specific assessment by ID (for test panel)
export const getSpecificAssessmentResults = async (assessmentId: string): Promise<FetchAssessmentResult> => {
  // Special test assessment ID that doesn't require completed=true
  const TEST_ASSESSMENT_ID = '08a5f01a-db17-474d-a3e8-c53bedbc34c8';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  try {
    // Fetch the specific assessment - for test assessments, don't require completed=true
    const TEST_ASSESSMENT_ID = 'db860913-600f-49b2-b9b2-d6fbc47cda2b';
    const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
    
    // For test assessments, don't filter by completed status at all
    let query = supabase
      .from('assessment_results')
      .select('*')
      .eq('id', assessmentId)
      .limit(1);
    
    // Only add completed filter for non-test assessments
    if (!isTestAssessment) {
      query = query.eq('completed', true);
    }
    
    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Assessment not found" };
    }

    const assessment = data[0];

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
    return { success: false, error: "An unexpected error occurred while fetching assessment" };
  }
};

// Add the getAssessmentById function that was missing
export const getAssessmentById = async (assessmentId: string): Promise<FetchAssessmentResult> => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, error: "Authentication error" };
    }

    if (!user) {
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
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Assessment not found" };
    }

    const assessment = data[0];
    // Log the raw assessment data for debugging
    
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
    return { success: false, error: "An unexpected error occurred while fetching assessment" };
  }
};

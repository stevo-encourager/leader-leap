
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface UseOpenAIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

interface InsightsState {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const useOpenAIInsights = ({ categories, demographics, averageGap, assessmentId }: UseOpenAIInsightsProps) => {
  // Consolidated state to prevent race conditions
  const [state, setState] = useState<InsightsState>({
    insights: null,
    isLoading: false,
    error: null,
    isInitialized: false
  });
  
  // Stable refs for tracking
  const currentAssessmentIdRef = useRef<string | undefined>(undefined);
  const isOperationInProgressRef = useRef(false);
  const initializationCompleteRef = useRef(false);
  
  // UPDATED: Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = '2631edf1-a358-4303-83c1-deb9664b53e2';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  // Safe state updater
  const updateState = useCallback((updates: Partial<InsightsState>, reason: string) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      return newState;
    });
  }, []);

  // ENHANCED: Better data validation function
  const validateDataForInsights = useCallback(() => {
    // Check if categories exist and have valid data
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log('useOpenAIInsights - No valid categories available');
      return false;
    }

    // Check if categories have skills with actual ratings
    const hasValidSkills = categories.some(category => 
      category && 
      category.skills && 
      Array.isArray(category.skills) && 
      category.skills.some(skill => 
        skill && 
        skill.ratings && 
        typeof skill.ratings.current === 'number' && 
        typeof skill.ratings.desired === 'number' &&
        (skill.ratings.current > 0 || skill.ratings.desired > 0)
      )
    );

    if (!hasValidSkills) {
      console.log('useOpenAIInsights - No skills with valid ratings found');
      return false;
    }

    // Check averageGap is valid
    if (typeof averageGap !== 'number' || isNaN(averageGap)) {
      console.log('useOpenAIInsights - Invalid averageGap:', averageGap);
      return false;
    }

    return true;
  }, [categories, averageGap]);

  // Reset state when assessment ID changes
  useEffect(() => {
    if (currentAssessmentIdRef.current !== assessmentId) {
      // Reset all state and refs
      updateState({
        insights: null,
        isLoading: false,
        error: null,
        isInitialized: false
      }, 'Assessment ID changed');
      
      isOperationInProgressRef.current = false;
      initializationCompleteRef.current = false;
      currentAssessmentIdRef.current = assessmentId;
    }
  }, [assessmentId, updateState]);

  // ENHANCED: Better initialization with improved data validation
  useEffect(() => {
    const initializeInsights = async () => {
      // Guard: Only run if not already initialized for this assessment
      if (initializationCompleteRef.current && currentAssessmentIdRef.current === assessmentId) {
        return;
      }

      // ENHANCED: Better validation of required data
      if (!validateDataForInsights()) {
        console.log('useOpenAIInsights - Data validation failed, waiting for valid data');
        return;
      }

      // Guard: Must have assessmentId for new assessments or be in test mode
      if (!assessmentId || assessmentId.trim() === '') {
        console.log('useOpenAIInsights - No assessmentId provided');
        return;
      }

      // Guard: Prevent multiple operations
      if (isOperationInProgressRef.current) {
        return;
      }
      
      // Mark operation as in progress
      isOperationInProgressRef.current = true;
      updateState({ isLoading: true, error: null }, 'Starting initialization');

      try {
        // ENHANCED: Add delay to ensure data is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check for existing insights
        const { data: assessment, error: dbError } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .single();

        if (dbError) {
          console.log('useOpenAIInsights - Database error checking existing insights:', dbError.message);
          // Continue to generate new insights
        } else if (assessment && 
                   assessment.ai_insights && 
                   assessment.ai_insights.trim() !== '' &&
                   assessment.ai_insights.trim() !== 'null' &&
                   assessment.ai_insights.trim() !== 'undefined') {
          
          let finalInsights = assessment.ai_insights;
          
          // Set successful state with existing insights
          updateState({
            insights: finalInsights,
            isLoading: false,
            error: null,
            isInitialized: true
          }, 'Found existing insights in database');
          
          initializationCompleteRef.current = true;
          isOperationInProgressRef.current = false;
          
          return;
        }

        // Generate new insights with enhanced validation
        await generateNewInsights();
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load insights';
        console.error('useOpenAIInsights - Initialization error:', errorMessage);
        
        updateState({
          error: errorMessage,
          isLoading: false,
          isInitialized: true
        }, 'Initialization error');
        
        initializationCompleteRef.current = true;
        isOperationInProgressRef.current = false;
      }
    };

    // ENHANCED: Better conditions for initialization
    if (assessmentId && validateDataForInsights() && !initializationCompleteRef.current) {
      // Add small delay to ensure all props are stable
      const timeoutId = setTimeout(() => {
        initializeInsights();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [assessmentId, categories, demographics, averageGap, updateState, validateDataForInsights]);

  const generateNewInsights = async () => {
    try {
      // ENHANCED: Final validation before API call
      if (!validateDataForInsights()) {
        throw new Error('Invalid data for insights generation');
      }

      console.log('useOpenAIInsights - Calling generate-insights with:', {
        categoriesCount: categories.length,
        averageGap,
        assessmentId,
        hasValidDemographics: demographics && Object.keys(demographics).length > 0
      });

      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId,
          forceRegenerate: isTestAssessment
        }
      });

      if (functionError) {
        console.error('useOpenAIInsights - Function error:', functionError);
        throw new Error(functionError.message || 'Edge Function error');
      }

      if (data && data.insights) {
        let finalInsights = data.insights;
        
        // Set successful state with new insights
        updateState({
          insights: finalInsights,
          isLoading: false,
          error: null,
          isInitialized: true
        }, 'Generated new insights from API');
        
        initializationCompleteRef.current = true;
        isOperationInProgressRef.current = false;
      } else {
        throw new Error('No insights received from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      console.error('useOpenAIInsights - Generation error:', errorMessage);
      
      updateState({
        error: errorMessage,
        isLoading: false,
        isInitialized: true
      }, 'Generation error');
      
      initializationCompleteRef.current = true;
      isOperationInProgressRef.current = false;
    }
  };

  const regenerateInsights = useCallback(async () => {
    // ENHANCED: Better validation for regeneration
    if (!validateDataForInsights() || !assessmentId) {
      updateState({
        error: 'Missing required data for regeneration',
        isLoading: false
      }, 'Regeneration validation failed');
      return;
    }
    
    // Set operation flag AFTER validation to prevent blocking
    isOperationInProgressRef.current = true;
    
    // Clear existing insights and set loading state IMMEDIATELY
    updateState({
      insights: null,
      error: null,
      isLoading: true,
      isInitialized: false
    }, 'Manual regeneration started - clearing old state');
    
    // Reset flags to allow new generation
    initializationCompleteRef.current = false;
    
    // Start new generation
    try {
      await generateNewInsights();
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Regeneration failed',
        isLoading: false,
        isInitialized: true
      }, 'Regeneration failed');
      
      // CRITICAL: Always reset the operation flag on both success and failure
      isOperationInProgressRef.current = false;
      initializationCompleteRef.current = true;
    }
  }, [categories, demographics, averageGap, assessmentId, isTestAssessment, updateState, validateDataForInsights]);

  return {
    insights: state.insights,
    isLoading: state.isLoading,
    error: state.error,
    regenerateInsights
  };
};

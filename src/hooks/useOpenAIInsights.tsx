
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

  // Single initialization effect that runs once per assessment
  useEffect(() => {
    const initializeInsights = async () => {
      // Guard: Only run if not already initialized for this assessment
      if (initializationCompleteRef.current && currentAssessmentIdRef.current === assessmentId) {
        return;
      }

      // Guard: Only proceed if we have valid data
      if (!categories || categories.length === 0 || !assessmentId || assessmentId.trim() === '') {
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
        // Check for existing insights
        const { data: assessment, error: dbError } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .single();

        if (dbError) {
          // Continue to generate new insights if we can't check existing ones
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

        await generateNewInsights();
        
      } catch (err) {
        updateState({
          error: err instanceof Error ? err.message : 'Failed to load insights',
          isLoading: false,
          isInitialized: true
        }, 'Initialization error');
        
        initializationCompleteRef.current = true;
        isOperationInProgressRef.current = false;
      }
    };

    // Only initialize if we have valid data and haven't initialized yet
    if (assessmentId && categories && categories.length > 0 && !initializationCompleteRef.current) {
      initializeInsights();
    }
  }, [assessmentId, categories, updateState]);

  const generateNewInsights = async () => {
    try {
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
        throw new Error(functionError.message);
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
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : 'Failed to generate insights',
        isLoading: false,
        isInitialized: true
      }, 'Generation error');
      
      initializationCompleteRef.current = true;
      isOperationInProgressRef.current = false;
    }
  };

  const regenerateInsights = useCallback(async () => {
    // Validate we have required data
    if (!categories || categories.length === 0 || !assessmentId) {
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
  }, [categories, demographics, averageGap, assessmentId, isTestAssessment, updateState]);

  return {
    insights: state.insights,
    isLoading: state.isLoading,
    error: state.error,
    regenerateInsights
  };
};

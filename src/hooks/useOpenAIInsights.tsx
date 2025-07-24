
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const TEST_ASSESSMENT_ID = '08a5f01a-db17-474d-a3e8-c53bedbc34c8';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  // Safe state updater
  const updateState = useCallback((updates: Partial<InsightsState>, reason: string) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      return newState;
    });
  }, []);

  // ENHANCED: Better data validation function that doesn't require assessmentId for new assessments
  // FIXED: Memoize the validation function to prevent unnecessary re-creation
  const validateDataForInsights = useMemo(() => {
    return () => {
      // Check if categories exist and have valid data
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return false;
      }

      // Check if categories have skills with actual ratings
      const hasValidSkills = categories.some(category => {
        if (!category || !category.skills || !Array.isArray(category.skills)) {
          return false;
        }
        
        return category.skills.some(skill => {
          if (!skill) return false;
          
          // Check for valid ratings in the correct format
          const hasValidRatings = skill.ratings && 
            typeof skill.ratings.current === 'number' && 
            typeof skill.ratings.desired === 'number' &&
            (skill.ratings.current > 0 || skill.ratings.desired > 0);
            
          return hasValidRatings;
        });
      });

      if (!hasValidSkills) {
        return false;
      }

      // Check averageGap is valid
      if (typeof averageGap !== 'number' || isNaN(averageGap)) {
        return false;
      }

      return true;
    };
  }, [categories, averageGap]);

  // Polling/retry logic for insights generation
  const generateNewInsights = useCallback(async (forceRegenerate = false) => {
    // Set loading state immediately when starting generation
    updateState({
      isLoading: true,
      error: null
    }, 'Starting insights generation');
    
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 6000;
    let attempt = 0;
    let lastError = null;
    while (attempt < MAX_RETRIES) {
      try {
        if (!validateDataForInsights()) {
          throw new Error('Invalid data for insights generation');
        }

        const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
          body: {
            categories,
            demographics,
            averageGap,
            assessmentId: assessmentId || null,
            forceRegenerate: forceRegenerate || isTestAssessment
          }
        });
        if (functionError) {
          // If the error is a 'still processing' or non-2xx, treat as retryable
          lastError = functionError.message || 'Edge Function error';
      
          // Wait and retry - longer delay for first attempt
          const delay = attempt === 0 ? 8000 : RETRY_DELAY_MS;
          await new Promise(res => setTimeout(res, delay));
          attempt++;
          continue;
        }
        if (data && data.insights) {
          const finalInsights = data.insights;
          updateState({
            insights: finalInsights,
            isLoading: false,
            error: null,
            isInitialized: true
          }, 'Generated new insights from API');
          initializationCompleteRef.current = true;
          isOperationInProgressRef.current = false;
          return;
        } else {
          // No insights yet, treat as retryable
          lastError = 'No insights received from API';
          await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
          attempt++;
          continue;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Failed to generate insights';
        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
        attempt++;
        continue;
      }
    }
    // If we reach here, all retries failed
    updateState({
      error: lastError || 'Failed to generate insights after multiple attempts',
      isLoading: false,
      isInitialized: true
    }, 'Generation error after retries');
    initializationCompleteRef.current = true;
    isOperationInProgressRef.current = false;
  }, [categories, demographics, averageGap, assessmentId, isTestAssessment, validateDataForInsights, updateState]);

  // ENHANCED: Better initialization logic that always checks database first
  const initializeInsights = useCallback(async () => {
    
    // Set operation flag to prevent concurrent operations
    if (isOperationInProgressRef.current) {
      return;
    }
    
    isOperationInProgressRef.current = true;
    
    // Set loading state when starting initialization
    updateState({
      isLoading: true,
      error: null
    }, 'Starting insights initialization');
    
    try {
      // ENHANCED: Always check database first for existing insights
      if (assessmentId) {
        const { data: assessment, error: dbError } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .maybeSingle();

        if (dbError) {
          // Continue to generate new insights
        } else if (assessment && 
                   assessment.ai_insights && 
                   assessment.ai_insights.trim() !== '' &&
                   assessment.ai_insights.trim().length > 100) {
          updateState({
            insights: assessment.ai_insights,
            isLoading: false,
            error: null,
            isInitialized: true
          }, 'Loaded existing insights from database');
          initializationCompleteRef.current = true;
          isOperationInProgressRef.current = false;
          return; // Exit early - use cached data
        } else {
          // No existing insights found in database
        }
      } else {
        // No assessmentId provided, proceeding to generate new insights
      }

      // ENHANCED: Only generate new insights if we don't have cached data
      if (validateDataForInsights()) {
        await generateNewInsights();
      } else {
        updateState({
          error: 'Missing required data for insights generation',
          isLoading: false
        }, 'Validation failed');
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Unknown error during initialization',
        isLoading: false
      }, 'Initialization error');
    } finally {
      isOperationInProgressRef.current = false;
    }
  }, [assessmentId, updateState, validateDataForInsights, generateNewInsights]);

  // Store the initializeInsights function in a ref to prevent recreation
  const initializeInsightsRef = useRef<() => Promise<void>>();
  initializeInsightsRef.current = initializeInsights;

  // FIXED: Stabilize the useEffect dependencies to prevent unnecessary re-initialization
  // Use a stable reference for the initialization check
  const shouldInitialize = useMemo(() => {
    return validateDataForInsights() && !state.isInitialized;
  }, [validateDataForInsights, state.isInitialized]);

  // Track component lifecycle
  useEffect(() => {
    return () => {
      // Component unmounting
    };
  }, [assessmentId]);

  // ENHANCED: Better initialization trigger that doesn't rely on local state
  useEffect(() => {
    // Only run if we have valid data and haven't completed initialization
    if (shouldInitialize && !isOperationInProgressRef.current) {
      initializeInsightsRef.current?.();
    }
  }, [assessmentId, shouldInitialize]);

  const regenerateInsights = useCallback(async () => {
    
    // ENHANCED: Better validation for regeneration - don't require assessmentId for new assessments
    if (!validateDataForInsights()) {
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
    
    // Start new generation with force flag
    try {
      await generateNewInsights(true); // Force regenerate
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
  }, [updateState, validateDataForInsights, generateNewInsights]);

  return {
    insights: state.insights,
    isLoading: state.isLoading,
    error: state.error,
    regenerateInsights
  };
};

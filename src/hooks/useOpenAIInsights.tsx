
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

// Assessment-specific guard to prevent duplicate API calls
interface AssessmentGuard {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
}

// Global map to store last data used for each assessment
const assessmentDataMap = new Map<string, AssessmentGuard>();

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

  // Assessment-specific guard function
  const shouldGenerateInsights = useCallback((currentAssessmentId: string | undefined): boolean => {
    // Always allow generation for test assessments
    if (isTestAssessment) {
      return true;
    }

    // If no assessment ID, allow generation (new assessment)
    if (!currentAssessmentId) {
      return true;
    }

    // Check if we have stored data for this assessment
    const lastData = assessmentDataMap.get(currentAssessmentId);
    if (!lastData) {
      // No stored data, allow generation
      return true;
    }

    // Compare current data with last data used for this assessment
    const currentData: AssessmentGuard = { categories, demographics, averageGap };
    
    // Deep comparison of categories
    const categoriesChanged = JSON.stringify(currentData.categories) !== JSON.stringify(lastData.categories);
    
    // Deep comparison of demographics
    const demographicsChanged = JSON.stringify(currentData.demographics) !== JSON.stringify(lastData.demographics);
    
    // Simple comparison of averageGap
    const averageGapChanged = currentData.averageGap !== lastData.averageGap;

    // If any data has changed, allow generation
    if (categoriesChanged || demographicsChanged || averageGapChanged) {
      return true;
    }

    // Data is identical for this assessment, prevent generation
    return false;
  }, [categories, demographics, averageGap, isTestAssessment]);

  // Store assessment data after successful generation
  const storeAssessmentData = useCallback((assessmentId: string | undefined) => {
    if (assessmentId && !isTestAssessment) {
      const dataToStore: AssessmentGuard = { categories, demographics, averageGap };
      assessmentDataMap.set(assessmentId, dataToStore);
    }
  }, [categories, demographics, averageGap, isTestAssessment]);

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
          
          // Store the data used for this assessment
          storeAssessmentData(assessmentId);
          
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
  }, [categories, demographics, averageGap, assessmentId, isTestAssessment, validateDataForInsights, updateState, storeAssessmentData]);

  // ENHANCED: Better initialization logic that always checks database first
  const initializeInsights = useCallback(async () => {
    // Set operation flag to prevent concurrent operations
    if (isOperationInProgressRef.current) {
      return;
    }
    
    // Check assessment-specific guard
    if (!shouldGenerateInsights(assessmentId)) {
      // Data hasn't changed for this assessment, skip generation
      updateState({
        isLoading: false,
        isInitialized: true
      }, 'Skipping generation - data unchanged for this assessment');
      initializationCompleteRef.current = true;
      return;
    }
    
    isOperationInProgressRef.current = true;
    
    try {
      // ENHANCED: Always check database first for existing insights
      if (assessmentId) {
        const { data: assessment, error: dbError } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .maybeSingle();

        if (dbError) {
          // Database error, continue to generate new insights
        } else if (assessment) {
          const assessmentData = assessment as any;
          if (assessmentData.ai_insights && 
              assessmentData.ai_insights.trim() !== '' &&
              assessmentData.ai_insights.trim().length > 100) {
            updateState({
              insights: assessmentData.ai_insights,
              isLoading: false,
              error: null,
              isInitialized: true
            }, 'Loaded existing insights from database');
            
            // Store the data used for this assessment
            storeAssessmentData(assessmentId);
            
            initializationCompleteRef.current = true;
            isOperationInProgressRef.current = false;
            return; // Exit early - use cached data
          }
        }
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
  }, [assessmentId, updateState, validateDataForInsights, generateNewInsights, shouldGenerateInsights, storeAssessmentData]);

  // FIXED: Stabilize the useEffect dependencies to prevent unnecessary re-initialization
  // Use a stable reference for the initialization check
  const shouldInitialize = useMemo(() => {
    return validateDataForInsights() && !initializationCompleteRef.current;
  }, [validateDataForInsights]);

  // ENHANCED: Better initialization trigger that doesn't rely on local state
  useEffect(() => {
    // Only run if we have valid data and haven't completed initialization
    if (shouldInitialize) {
      initializeInsights();
    }
  }, [assessmentId, shouldInitialize, initializeInsights]);

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


import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { processInsightsForBookLabeling } from '@/utils/summaryFormatter';

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
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  // Helper function to create timestamped debug logs
  const debugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().slice(11, 23);
    if (data) {
      console.log(`🔍 [${timestamp}] ${message}`, data);
    } else {
      console.log(`🔍 [${timestamp}] ${message}`);
    }
  };

  // Safe state updater with logging
  const updateState = useCallback((updates: Partial<InsightsState>, reason: string) => {
    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(`📝 [${timestamp}] STATE UPDATE: ${reason}`);
    console.log(`📝 [${timestamp}] Updates:`, updates);
    
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      console.log(`📝 [${timestamp}] Previous state:`, prevState);
      console.log(`📝 [${timestamp}] New state:`, newState);
      return newState;
    });
  }, []);

  debugLog('HOOK RENDER:', {
    assessmentId,
    isTestAssessment,
    categoriesLength: categories?.length || 0,
    currentState: state,
    currentAssessmentId: currentAssessmentIdRef.current,
    isOperationInProgress: isOperationInProgressRef.current,
    initializationComplete: initializationCompleteRef.current
  });

  // Reset state when assessment ID changes
  useEffect(() => {
    debugLog('ASSESSMENT ID EFFECT:', {
      newAssessmentId: assessmentId,
      currentAssessmentId: currentAssessmentIdRef.current,
      willReset: currentAssessmentIdRef.current !== assessmentId
    });

    if (currentAssessmentIdRef.current !== assessmentId) {
      debugLog('🔄 RESETTING STATE: Assessment ID changed');
      
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
      
      debugLog('✅ STATE RESET COMPLETE');
    }
  }, [assessmentId, updateState]);

  // Single initialization effect that runs once per assessment
  useEffect(() => {
    const initializeInsights = async () => {
      // Guard: Only run if not already initialized for this assessment
      if (initializationCompleteRef.current && currentAssessmentIdRef.current === assessmentId) {
        debugLog('❌ ALREADY INITIALIZED - Skipping');
        return;
      }

      // Guard: Only proceed if we have valid data
      if (!categories || categories.length === 0 || !assessmentId || assessmentId.trim() === '') {
        debugLog('❌ MISSING REQUIRED DATA - Skipping initialization');
        return;
      }

      // Guard: Prevent multiple operations
      if (isOperationInProgressRef.current) {
        debugLog('❌ OPERATION IN PROGRESS - Skipping duplicate initialization');
        return;
      }

      debugLog('🚀 STARTING INITIALIZATION:', assessmentId);
      
      // Mark operation as in progress
      isOperationInProgressRef.current = true;
      updateState({ isLoading: true, error: null }, 'Starting initialization');

      try {
        // Check for existing insights
        debugLog('🔍 CHECKING DATABASE FOR EXISTING INSIGHTS');
        const { data: assessment, error: dbError } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .single();

        if (dbError) {
          debugLog('❌ DATABASE ERROR:', dbError);
          // Continue to generate new insights if we can't check existing ones
        } else if (assessment && 
                   assessment.ai_insights && 
                   assessment.ai_insights.trim() !== '' &&
                   assessment.ai_insights.trim() !== 'null' &&
                   assessment.ai_insights.trim() !== 'undefined') {
          
          debugLog('✅ FOUND EXISTING INSIGHTS');
          debugLog('📄 INSIGHTS DATA:', assessment.ai_insights.substring(0, 200) + '...');
          
          // ENHANCED: Apply book labeling to existing insights too
          console.log('📚 APPLYING BOOK LABELING TO EXISTING INSIGHTS');
          let finalInsights = assessment.ai_insights;
          
          try {
            const parsedInsights = JSON.parse(assessment.ai_insights);
            console.log('📚 EXISTING INSIGHTS: Successfully parsed existing insights');
            const processedInsights = processInsightsForBookLabeling(parsedInsights);
            finalInsights = JSON.stringify(processedInsights);
            console.log('📚 EXISTING INSIGHTS: Book labeling applied to existing insights');
          } catch (parseError) {
            console.log('📚 EXISTING INSIGHTS: Could not parse existing insights for book labeling, using as-is:', parseError);
          }
          
          // Set successful state with processed existing insights
          updateState({
            insights: finalInsights,
            isLoading: false,
            error: null,
            isInitialized: true
          }, 'Found existing insights in database with book labeling applied');
          
          initializationCompleteRef.current = true;
          isOperationInProgressRef.current = false;
          
          debugLog('✅ INITIALIZATION COMPLETE WITH EXISTING INSIGHTS');
          return;
        }

        debugLog('🔄 NO EXISTING INSIGHTS - GENERATING NEW');
        await generateNewInsights();
        
      } catch (err) {
        debugLog('❌ INITIALIZATION ERROR:', err);
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
      debugLog('✅ PROCEEDING WITH INITIALIZATION');
      initializeInsights();
    } else {
      debugLog('❌ SKIPPING INITIALIZATION - Conditions not met');
    }
  }, [assessmentId, categories, updateState]);

  const generateNewInsights = async () => {
    debugLog('🔄 STARTING NEW INSIGHTS GENERATION');

    try {
      debugLog('📡 CALLING SUPABASE FUNCTION');
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId,
          forceRegenerate: isTestAssessment
        }
      });

      debugLog('📡 SUPABASE FUNCTION RESPONSE:', { data, functionError });

      if (functionError) {
        debugLog('❌ FUNCTION ERROR:', functionError);
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        debugLog('✅ SUCCESS: Received new insights from API');
        debugLog('📄 NEW INSIGHTS DATA:', data.insights.substring(0, 200) + '...');
        
        // ENHANCED: Process insights to ensure book recommendations are properly labeled
        console.log('📚 NEW INSIGHTS: Starting book labeling process');
        let finalInsights = data.insights;
        
        try {
          const parsedInsights = JSON.parse(data.insights);
          console.log('📚 NEW INSIGHTS: Successfully parsed new insights from API');
          const processedInsights = processInsightsForBookLabeling(parsedInsights);
          finalInsights = JSON.stringify(processedInsights);
          console.log('📚 NEW INSIGHTS: Book labeling applied to new insights');
        } catch (parseError) {
          console.log('📚 NEW INSIGHTS: Could not parse new insights for book labeling, using as-is:', parseError);
        }
        
        debugLog('📚 BOOK LABELING APPLIED: Processed insights for consistent book recommendation labeling');
        
        // Set successful state with processed insights
        updateState({
          insights: finalInsights,
          isLoading: false,
          error: null,
          isInitialized: true
        }, 'Generated new insights from API with book labeling applied');
        
        initializationCompleteRef.current = true;
        isOperationInProgressRef.current = false;
        
        debugLog('✅ GENERATION COMPLETE: New insights set with book labeling');
      } else {
        debugLog('❌ NO INSIGHTS IN RESPONSE');
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      debugLog('❌ GENERATION ERROR:', err);
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
    debugLog('🔄 REGENERATE INSIGHTS CALLED');
    
    // FIXED: Remove the operation in progress check for regeneration
    // This was blocking subsequent regeneration attempts
    debugLog('🔄 REGENERATE: Starting manual regeneration (bypassing operation check)');
    
    // Validate we have required data
    if (!categories || categories.length === 0 || !assessmentId) {
      debugLog('❌ MISSING REQUIRED DATA FOR REGENERATION');
      updateState({
        error: 'Missing required data for regeneration',
        isLoading: false
      }, 'Regeneration validation failed');
      return;
    }
    
    // FIXED: Set operation flag AFTER validation to prevent blocking
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
    
    debugLog('🔄 REGENERATE: State cleared, calling generateNewInsights');
    
    // Start new generation
    try {
      await generateNewInsights();
      debugLog('✅ REGENERATE: Completed successfully');
    } catch (error) {
      debugLog('❌ REGENERATE: Failed with error:', error);
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

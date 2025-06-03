
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface UseOpenAIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

export const useOpenAIInsights = ({ categories, demographics, averageGap, assessmentId }: UseOpenAIInsightsProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent effect re-triggers and track state
  const currentAssessmentIdRef = useRef<string | undefined>(undefined);
  const isOperationInProgressRef = useRef(false);
  const hasSuccessfullyLoadedRef = useRef(false);
  const hasErroredRef = useRef(false);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  // Helper function to create timestamped debug logs
  const debugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    if (data) {
      console.log(`🔍 [${timestamp}] ${message}`, data);
    } else {
      console.log(`🔍 [${timestamp}] ${message}`);
    }
  };

  debugLog('HOOK RENDER:', {
    assessmentId,
    isTestAssessment,
    categoriesLength: categories?.length || 0,
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    currentAssessmentId: currentAssessmentIdRef.current,
    isOperationInProgress: isOperationInProgressRef.current,
    hasSuccessfullyLoaded: hasSuccessfullyLoadedRef.current,
    hasErrored: hasErroredRef.current
  });

  // Reset all state when assessment ID changes
  useEffect(() => {
    debugLog('ASSESSMENT ID EFFECT:', {
      newAssessmentId: assessmentId,
      currentAssessmentId: currentAssessmentIdRef.current,
      willReset: currentAssessmentIdRef.current !== assessmentId
    });

    if (currentAssessmentIdRef.current !== assessmentId) {
      debugLog('🔄 STATE RESET: Assessment ID changed, clearing all state');
      
      // Reset all state
      setInsights(null);
      setError(null);
      setIsLoading(false);
      
      // Reset refs
      isOperationInProgressRef.current = false;
      hasSuccessfullyLoadedRef.current = false;
      hasErroredRef.current = false;
      currentAssessmentIdRef.current = assessmentId;
      
      debugLog('✅ STATE RESET COMPLETE');
    }
  }, [assessmentId]);

  // Main data loading effect - only runs once per assessment ID unless manually triggered
  useEffect(() => {
    const loadInsights = async () => {
      // Guard: Only proceed if we have valid data
      if (!categories || categories.length === 0 || !assessmentId || assessmentId.trim() === '') {
        debugLog('❌ MISSING REQUIRED DATA - Skipping load');
        return;
      }

      // Guard: Prevent multiple operations
      if (isOperationInProgressRef.current) {
        debugLog('❌ OPERATION IN PROGRESS - Skipping duplicate load');
        return;
      }

      // Guard: Skip if we already successfully loaded data for this assessment
      if (hasSuccessfullyLoadedRef.current && currentAssessmentIdRef.current === assessmentId) {
        debugLog('❌ ALREADY SUCCESSFULLY LOADED - Skipping duplicate load');
        return;
      }

      // Guard: Skip if we already errored for this assessment (prevent auto-retry)
      if (hasErroredRef.current && currentAssessmentIdRef.current === assessmentId) {
        debugLog('❌ ALREADY ERRORED - Skipping auto-retry (manual regeneration required)');
        return;
      }

      debugLog('🚀 STARTING LOAD OPERATION:', assessmentId);
      
      // Set operation in progress BEFORE any async operations
      isOperationInProgressRef.current = true;
      debugLog('⏳ LOADING STATE TRANSITION: FALSE → TRUE (Starting operation)');
      setIsLoading(true);
      setError(null);

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
          
          debugLog('✅ SUCCESS STATE TRANSITION: Found existing insights');
          debugLog('📄 INSIGHTS DATA:', assessment.ai_insights.substring(0, 200) + '...');
          
          setInsights(assessment.ai_insights);
          debugLog('⏳ LOADING STATE TRANSITION: TRUE → FALSE (Found existing insights)');
          setIsLoading(false);
          hasSuccessfullyLoadedRef.current = true;
          isOperationInProgressRef.current = false;
          
          debugLog('✅ SUCCESS COMPLETE: Insights displayed, loading stopped, marked as successfully loaded');
          return; // Exit early - we have existing insights
        }

        debugLog('🔄 NO EXISTING INSIGHTS - GENERATING NEW');
        await generateNewInsights();
        
      } catch (err) {
        debugLog('❌ ERROR STATE TRANSITION: Load operation failed', err);
        setError(err instanceof Error ? err.message : 'Failed to load insights');
        debugLog('⏳ LOADING STATE TRANSITION: TRUE → FALSE (Error occurred)');
        setIsLoading(false);
        isOperationInProgressRef.current = false;
        hasErroredRef.current = true;
        debugLog('🛑 ERROR STATE STABLE: No auto-retry will occur');
      }
    };

    // Only run if we haven't successfully loaded data yet AND haven't errored for this assessment
    if (!hasSuccessfullyLoadedRef.current && !hasErroredRef.current && assessmentId && categories && categories.length > 0) {
      loadInsights();
    }
  }, [assessmentId]); // Only depend on assessmentId

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
        debugLog('❌ ERROR STATE TRANSITION: Function returned error', functionError);
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        debugLog('✅ SUCCESS STATE TRANSITION: Received new insights from API');
        debugLog('📄 NEW INSIGHTS DATA:', data.insights.substring(0, 200) + '...');
        
        setInsights(data.insights);
        debugLog('⏳ LOADING STATE TRANSITION: TRUE → FALSE (New insights received)');
        setIsLoading(false);
        hasSuccessfullyLoadedRef.current = true; // Mark as successfully loaded
        isOperationInProgressRef.current = false;
        
        debugLog('✅ SUCCESS COMPLETE: New insights displayed, loading stopped, marked as successfully loaded');
      } else {
        debugLog('❌ ERROR STATE TRANSITION: No insights in API response');
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      debugLog('❌ ERROR STATE TRANSITION: Generation failed', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      debugLog('⏳ LOADING STATE TRANSITION: TRUE → FALSE (Generation error)');
      setIsLoading(false);
      isOperationInProgressRef.current = false;
      hasErroredRef.current = true;
      debugLog('🛑 ERROR STATE STABLE: Manual regeneration required');
    }
  };

  const regenerateInsights = () => {
    debugLog('🔄 MANUAL REGENERATE TRIGGERED');
    
    // Prevent multiple regenerations
    if (isOperationInProgressRef.current) {
      debugLog('❌ REGENERATION ALREADY IN PROGRESS - Skipping');
      return;
    }

    // Clear previous state
    debugLog('🔄 REGENERATE: Clearing previous state for fresh generation');
    setError(null);
    setInsights(null);
    
    // Reset loaded and error flags to allow new generation
    hasSuccessfullyLoadedRef.current = false;
    hasErroredRef.current = false;
    
    // Start new generation
    if (categories && categories.length > 0 && assessmentId) {
      isOperationInProgressRef.current = true;
      debugLog('⏳ LOADING STATE TRANSITION: FALSE → TRUE (Manual regeneration started)');
      setIsLoading(true);
      generateNewInsights();
    }
  };

  return {
    insights,
    isLoading,
    error,
    regenerateInsights
  };
};

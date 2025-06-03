
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
  const hasLoadedDataRef = useRef(false);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  console.log('🔍 HOOK RENDER:', {
    assessmentId,
    isTestAssessment,
    categoriesLength: categories?.length || 0,
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    currentAssessmentId: currentAssessmentIdRef.current,
    isOperationInProgress: isOperationInProgressRef.current,
    hasLoadedData: hasLoadedDataRef.current
  });

  // Reset all state when assessment ID changes
  useEffect(() => {
    console.log('🔍 ASSESSMENT ID EFFECT:', {
      newAssessmentId: assessmentId,
      currentAssessmentId: currentAssessmentIdRef.current,
      willReset: currentAssessmentIdRef.current !== assessmentId
    });

    if (currentAssessmentIdRef.current !== assessmentId) {
      console.log('🔍 RESETTING STATE - Assessment ID changed');
      
      // Reset all state
      setInsights(null);
      setError(null);
      setIsLoading(false);
      
      // Reset refs
      isOperationInProgressRef.current = false;
      hasLoadedDataRef.current = false;
      currentAssessmentIdRef.current = assessmentId;
    }
  }, [assessmentId]);

  // Main data loading effect - only runs once per assessment ID
  useEffect(() => {
    const loadInsights = async () => {
      // Guard: Only proceed if we have valid data
      if (!categories || categories.length === 0 || !assessmentId || assessmentId.trim() === '') {
        console.log('🔍 MISSING REQUIRED DATA - Skipping load');
        return;
      }

      // Guard: Prevent multiple operations
      if (isOperationInProgressRef.current) {
        console.log('🔍 OPERATION IN PROGRESS - Skipping duplicate load');
        return;
      }

      // Guard: Skip if we already loaded data for this assessment
      if (hasLoadedDataRef.current && currentAssessmentIdRef.current === assessmentId) {
        console.log('🔍 DATA ALREADY LOADED - Skipping duplicate load');
        return;
      }

      console.log('🔍 STARTING LOAD OPERATION:', assessmentId);
      
      // Set operation in progress BEFORE any async operations
      isOperationInProgressRef.current = true;
      console.log('🔍 ⏳ LOADING STATE: Setting loading to TRUE - Starting operation');
      setIsLoading(true);
      setError(null);

      try {
        // Check for existing insights
        console.log('🔍 CHECKING DATABASE FOR EXISTING INSIGHTS');
        const { data: assessment, error: dbError } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .single();

        if (dbError) {
          console.error('🔍 DATABASE ERROR:', dbError);
          // Continue to generate new insights if we can't check existing ones
        } else if (assessment && 
                   assessment.ai_insights && 
                   assessment.ai_insights.trim() !== '' &&
                   assessment.ai_insights.trim() !== 'null' &&
                   assessment.ai_insights.trim() !== 'undefined') {
          
          console.log('🔍 ✅ SUCCESS: Found existing insights - Setting results and stopping loading');
          console.log('🔍 📄 INSIGHTS DATA:', assessment.ai_insights.substring(0, 200) + '...');
          
          setInsights(assessment.ai_insights);
          console.log('🔍 ⏳ LOADING STATE: Setting loading to FALSE - Found existing insights');
          setIsLoading(false);
          hasLoadedDataRef.current = true;
          isOperationInProgressRef.current = false;
          
          console.log('🔍 ✅ SUCCESS COMPLETE: Insights displayed, loading stopped');
          return; // Exit early - we have existing insights
        }

        console.log('🔍 NO EXISTING INSIGHTS - GENERATING NEW');
        await generateNewInsights();
        
      } catch (err) {
        console.error('🔍 ❌ ERROR IN LOAD OPERATION:', err);
        setError(err instanceof Error ? err.message : 'Failed to load insights');
        console.log('🔍 ⏳ LOADING STATE: Setting loading to FALSE - Error occurred');
        setIsLoading(false);
        isOperationInProgressRef.current = false;
      }
    };

    // Only run if we haven't loaded data yet for this assessment
    if (!hasLoadedDataRef.current && assessmentId && categories && categories.length > 0) {
      loadInsights();
    }
  }, [assessmentId]); // Only depend on assessmentId

  const generateNewInsights = async () => {
    console.log('🔍 STARTING NEW INSIGHTS GENERATION');

    try {
      console.log('🔍 CALLING SUPABASE FUNCTION');
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId,
          forceRegenerate: isTestAssessment
        }
      });

      console.log('🔍 SUPABASE FUNCTION RESPONSE:', { data, functionError });

      if (functionError) {
        console.error('🔍 ❌ FUNCTION ERROR:', functionError);
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        console.log('🔍 ✅ SUCCESS: Received new insights from API');
        console.log('🔍 📄 NEW INSIGHTS DATA:', data.insights.substring(0, 200) + '...');
        
        setInsights(data.insights);
        console.log('🔍 ⏳ LOADING STATE: Setting loading to FALSE - New insights received');
        setIsLoading(false);
        hasLoadedDataRef.current = true;
        isOperationInProgressRef.current = false;
        
        console.log('🔍 ✅ SUCCESS COMPLETE: New insights displayed, loading stopped');
      } else {
        console.error('🔍 ❌ NO INSIGHTS IN RESPONSE');
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      console.error('🔍 ❌ ERROR GENERATING INSIGHTS:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      console.log('🔍 ⏳ LOADING STATE: Setting loading to FALSE - Generation error');
      setIsLoading(false);
      isOperationInProgressRef.current = false;
      // Do NOT set hasLoadedDataRef to true on error - allow retry
    }
  };

  const regenerateInsights = () => {
    console.log('🔍 🔄 MANUAL REGENERATE TRIGGERED');
    
    // Prevent multiple regenerations
    if (isOperationInProgressRef.current) {
      console.log('🔍 REGENERATION ALREADY IN PROGRESS - Skipping');
      return;
    }

    // Clear previous state
    console.log('🔍 🔄 REGENERATE: Clearing previous error and insights');
    setError(null);
    setInsights(null);
    
    // Reset loaded flag to allow new generation
    hasLoadedDataRef.current = false;
    
    // Start new generation
    if (categories && categories.length > 0 && assessmentId) {
      isOperationInProgressRef.current = true;
      console.log('🔍 ⏳ LOADING STATE: Setting loading to TRUE - Manual regeneration started');
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

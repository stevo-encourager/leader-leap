
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
  
  // Use refs to track operation state and prevent duplicates
  const isInitializedRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const hasLoadedInsightsRef = useRef(false);
  const lastAssessmentIdRef = useRef<string | undefined>(undefined);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  console.log('🔍 HOOK INIT:', {
    assessmentId,
    isTestAssessment,
    categoriesLength: categories?.length || 0,
    hasInsights: !!insights,
    isLoading,
    hasError: !!error,
    isInitialized: isInitializedRef.current,
    isGenerating: isGeneratingRef.current,
    hasLoadedInsights: hasLoadedInsightsRef.current
  });

  // Reset state when assessment ID changes
  useEffect(() => {
    if (lastAssessmentIdRef.current !== assessmentId) {
      console.log('🔍 ASSESSMENT ID CHANGED - RESETTING STATE:', {
        from: lastAssessmentIdRef.current,
        to: assessmentId
      });
      
      setInsights(null);
      setError(null);
      setIsLoading(false);
      isInitializedRef.current = false;
      isGeneratingRef.current = false;
      hasLoadedInsightsRef.current = false;
      lastAssessmentIdRef.current = assessmentId;
    }
  }, [assessmentId]);

  // Main effect for loading insights
  useEffect(() => {
    const loadInsights = async () => {
      // Only proceed if we have valid data and haven't initialized yet
      if (!categories || categories.length === 0 || !assessmentId || assessmentId.trim() === '') {
        console.log('🔍 MISSING REQUIRED DATA - Skipping load');
        return;
      }

      // Prevent duplicate initialization
      if (isInitializedRef.current) {
        console.log('🔍 ALREADY INITIALIZED - Skipping duplicate load');
        return;
      }

      // Prevent simultaneous operations
      if (isGeneratingRef.current) {
        console.log('🔍 OPERATION IN PROGRESS - Skipping duplicate load');
        return;
      }

      console.log('🔍 STARTING INSIGHTS LOAD FOR:', assessmentId);
      isInitializedRef.current = true;

      try {
        // First check for existing insights in database
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
          
          console.log('🔍 FOUND EXISTING INSIGHTS - LOADING FROM DATABASE');
          setInsights(assessment.ai_insights);
          hasLoadedInsightsRef.current = true;
          return; // Exit early - we have existing insights
        }

        console.log('🔍 NO EXISTING INSIGHTS FOUND - GENERATING NEW');
        await generateNewInsights();
        
      } catch (err) {
        console.error('🔍 ERROR IN LOAD INSIGHTS:', err);
        setError(err instanceof Error ? err.message : 'Failed to load insights');
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [assessmentId, categories, demographics, averageGap]);

  const generateNewInsights = async () => {
    // Prevent simultaneous generation
    if (isGeneratingRef.current) {
      console.log('🔍 GENERATION ALREADY IN PROGRESS - Skipping');
      return;
    }

    console.log('🔍 STARTING NEW INSIGHTS GENERATION');
    
    // Set operation flags and loading state
    isGeneratingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 CALLING SUPABASE FUNCTION');
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId,
          forceRegenerate: isTestAssessment // Only force regenerate for test assessment
        }
      });

      console.log('🔍 SUPABASE FUNCTION RESPONSE:', { data, functionError });

      if (functionError) {
        console.error('🔍 FUNCTION ERROR:', functionError);
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        console.log('🔍 SUCCESS - RECEIVED NEW INSIGHTS');
        setInsights(data.insights);
        hasLoadedInsightsRef.current = true;
        setIsLoading(false);
      } else {
        console.error('🔍 NO INSIGHTS IN RESPONSE');
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      console.error('🔍 ERROR GENERATING INSIGHTS:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      setIsLoading(false);
    } finally {
      // Always reset generation flag
      isGeneratingRef.current = false;
      console.log('🔍 GENERATION COMPLETE - Reset flags');
    }
  };

  const regenerateInsights = () => {
    console.log('🔍 MANUAL REGENERATE TRIGGERED');
    
    // Clear any previous error state
    setError(null);
    
    // For test assessment, clear existing insights to force regeneration
    if (isTestAssessment) {
      console.log('🔍 TEST ASSESSMENT - Clearing existing insights for regeneration');
      setInsights(null);
      hasLoadedInsightsRef.current = false;
    }
    
    // Reset initialization flag to allow regeneration
    isInitializedRef.current = false;
    
    // Start generation
    generateNewInsights();
  };

  return {
    insights,
    isLoading,
    error,
    regenerateInsights
  };
};

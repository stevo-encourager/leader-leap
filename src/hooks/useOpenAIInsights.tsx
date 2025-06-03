
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
  const hasCheckedExistingRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const insightsLoadedRef = useRef(false);
  const forceRegenerateRef = useRef(false);
  const [regenerateTrigger, setRegenerateTrigger] = useState(0); // NEW: State to trigger effect re-run

  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  // CRITICAL SAFEGUARD: Check for existing insights first and NEVER regenerate if they exist (except for test assessment)
  useEffect(() => {
    const checkForExistingInsights = async () => {
      // CRITICAL PROTECTION: If we already have insights loaded and it's not a test assessment, NEVER check again
      if (insightsLoadedRef.current && !isTestAssessment) {
        console.log('CRITICAL PROTECTION: Insights already loaded - preventing any further operations');
        return;
      }

      // PROTECTION: Prevent multiple simultaneous checks (except for test assessment regeneration)
      if ((hasCheckedExistingRef.current || isGeneratingRef.current) && !isTestAssessment && !forceRegenerateRef.current) {
        console.log('CRITICAL PROTECTION: Already checked or generating - preventing duplicate operation');
        return;
      }

      // Only proceed if we have valid data
      if (!categories || categories.length === 0) {
        console.log('useOpenAIInsights: No categories available for insights');
        return;
      }

      console.log('CRITICAL SAFEGUARD: Checking for existing insights for assessment:', assessmentId);
      console.log('TEST ASSESSMENT CHECK: Is test assessment?', isTestAssessment);
      console.log('FORCE REGENERATE: Force regenerate flag?', forceRegenerateRef.current);
      
      // For test assessment with force regenerate, skip database check entirely
      if (isTestAssessment && forceRegenerateRef.current) {
        console.log('TEST ASSESSMENT: Force regenerate flag is set - skipping database check and generating new insights');
        forceRegenerateRef.current = false; // Reset the flag
        await generateNewInsights();
        return;
      }
      
      hasCheckedExistingRef.current = true;

      try {
        if (assessmentId && assessmentId.trim() !== '') {
          console.log('CRITICAL SAFEGUARD: Checking database for existing insights');
          
          // For saved assessments, ALWAYS check database first with enhanced validation
          const { data: assessment, error } = await supabase
            .from('assessment_results')
            .select('ai_insights')
            .eq('id', assessmentId)
            .single();

          if (error) {
            console.error('useOpenAIInsights: Error checking for existing insights:', error);
            // Continue to generate new insights if we can't check existing ones
          } else if (assessment && 
                     assessment.ai_insights && 
                     assessment.ai_insights.trim() !== '' &&
                     assessment.ai_insights.trim() !== 'null' &&
                     assessment.ai_insights.trim() !== 'undefined') {
            
            if (isTestAssessment) {
              console.log('TEST ASSESSMENT: Found existing insights but no force regenerate - using existing');
              setInsights(assessment.ai_insights);
              return;
            } else {
              console.log('CRITICAL PROTECTION: Found existing insights - using saved version - NEVER regenerating');
              console.log('CRITICAL PROTECTION: Insights length:', assessment.ai_insights.length);
              setInsights(assessment.ai_insights);
              insightsLoadedRef.current = true; // Mark as loaded to prevent future operations
              return; // CRITICAL: Exit early - don't generate new insights
            }
          }
        }

        // Only generate new insights if none exist and we're not already generating
        if (!isGeneratingRef.current && (!insightsLoadedRef.current || isTestAssessment)) {
          console.log('CRITICAL SAFEGUARD: No existing insights found, generating new ones (ONLY ONCE)');
          if (isTestAssessment) {
            console.log('TEST ASSESSMENT: Generating insights for test assessment (regeneration allowed)');
          }
          await generateNewInsights();
        }
        
      } catch (err) {
        console.error('useOpenAIInsights: Error in checkForExistingInsights:', err);
        setError(err instanceof Error ? err.message : 'Failed to check for existing insights');
      }
    };

    checkForExistingInsights();
  }, [assessmentId, regenerateTrigger]); // CRITICAL FIX: Include regenerateTrigger to re-run effect

  const generateNewInsights = async () => {
    // PROTECTION: Prevent simultaneous generation
    if (isGeneratingRef.current) {
      console.log('CRITICAL PROTECTION: Already generating insights - preventing duplicate generation');
      return;
    }

    // PROTECTION: Never generate if insights are already loaded (except for test assessment)
    if (insightsLoadedRef.current && !isTestAssessment && !forceRegenerateRef.current) {
      console.log('CRITICAL PROTECTION: Insights already loaded - preventing regeneration');
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('useOpenAIInsights: No categories available for insights generation');
      return;
    }

    console.log('CRITICAL SAFEGUARD: Starting insight generation with protection flags');
    if (isTestAssessment) {
      console.log('TEST ASSESSMENT: Generating insights for test assessment');
    }
    
    isGeneratingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('useOpenAIInsights: Calling generate-insights function with assessmentId:', assessmentId);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        setInsights(data.insights);
        // Only mark as permanently loaded for non-test assessments
        if (!isTestAssessment) {
          insightsLoadedRef.current = true; // Mark as loaded to prevent future operations
        }
        console.log('CRITICAL SUCCESS: Successfully received and stored AI insights');
        if (isTestAssessment) {
          console.log('TEST ASSESSMENT: Insights generated for test assessment (can be regenerated)');
        } else {
          console.log('PRODUCTION ASSESSMENT: Insights generated permanently');
        }
      } else {
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      console.error('useOpenAIInsights: Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
      isGeneratingRef.current = false;
    }
  };

  return {
    insights,
    isLoading,
    error,
    // Provide a manual regenerate function with special handling for test assessment
    regenerateInsights: () => {
      if (isTestAssessment) {
        console.log('TEST ASSESSMENT: Manual regeneration requested for test assessment - allowing');
        // Set force regenerate flag and clear current insights for test assessment
        forceRegenerateRef.current = true;
        hasCheckedExistingRef.current = false; // Reset to allow effect to run again
        setInsights(null); // Clear current insights to show loading state
        // Trigger the effect to run again which will detect the force regenerate flag
        setRegenerateTrigger(prev => prev + 1); // NEW: Trigger effect re-run
      } else {
        console.log('CRITICAL WARNING: Manual regeneration requested - this should only be used for new assessments');
        // Reset the loaded flag only for manual regeneration of non-test assessments
        insightsLoadedRef.current = false;
        hasCheckedExistingRef.current = false;
        generateNewInsights();
      }
    }
  };
};

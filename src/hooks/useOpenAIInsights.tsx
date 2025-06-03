
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
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [regenerateTrigger, setRegenerateTrigger] = useState(0);

  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  console.log('🔍 USEOPEN_AI_INSIGHTS HOOK INIT:', {
    assessmentId,
    isTestAssessment,
    forceRegenerate,
    regenerateTrigger,
    categoriesLength: categories?.length || 0,
    hasExistingInsights: !!insights
  });

  // CRITICAL SAFEGUARD: Check for existing insights first and NEVER regenerate if they exist (except for test assessment)
  useEffect(() => {
    console.log('🔍 EFFECT TRIGGERED:', {
      assessmentId,
      regenerateTrigger,
      forceRegenerate,
      isTestAssessment,
      categoriesLength: categories?.length || 0,
      hasCheckedExistingRef: hasCheckedExistingRef.current,
      isGeneratingRef: isGeneratingRef.current,
      insightsLoadedRef: insightsLoadedRef.current
    });

    const checkForExistingInsights = async () => {
      // Only proceed if we have valid data
      if (!categories || categories.length === 0) {
        console.log('🔍 NO CATEGORIES - Exiting early');
        return;
      }

      console.log('🔍 STARTING INSIGHTS CHECK:', {
        assessmentId,
        isTestAssessment,
        forceRegenerate,
        hasCheckedExistingRef: hasCheckedExistingRef.current,
        isGeneratingRef: isGeneratingRef.current,
        insightsLoadedRef: insightsLoadedRef.current
      });
      
      // CRITICAL FIX: For test assessment with force regenerate, bypass EVERYTHING and generate new insights
      if (isTestAssessment && forceRegenerate) {
        console.log('🔍 TEST ASSESSMENT FORCE REGENERATE - Bypassing all checks');
        console.log('🔍 CLEARING ALL STATE FLAGS AND INSIGHTS');
        
        setInsights(null); // Clear current insights
        hasCheckedExistingRef.current = false; // Reset to allow generation
        isGeneratingRef.current = false; // Reset generation flag
        insightsLoadedRef.current = false; // Reset loaded flag
        
        console.log('🔍 CALLING GENERATE NEW INSIGHTS WITH FORCE=TRUE');
        await generateNewInsights(true); // Pass true to indicate force regeneration
        
        // IMPORTANT: Reset forceRegenerate flag AFTER generation is complete
        console.log('🔍 RESETTING FORCE REGENERATE FLAG TO FALSE');
        setForceRegenerate(false);
        return;
      }
      
      // CRITICAL PROTECTION: If we already have insights loaded and it's not a test assessment, NEVER check again
      if (insightsLoadedRef.current && !isTestAssessment) {
        console.log('🔍 INSIGHTS ALREADY LOADED (NON-TEST) - Preventing further operations');
        return;
      }
      
      // PROTECTION: Prevent multiple simultaneous checks (except for test assessment regeneration)
      if ((hasCheckedExistingRef.current || isGeneratingRef.current) && !forceRegenerate) {
        console.log('🔍 ALREADY CHECKED OR GENERATING - Preventing duplicate operation');
        return;
      }
      
      hasCheckedExistingRef.current = true;
      console.log('🔍 SET hasCheckedExistingRef TO TRUE');

      try {
        if (assessmentId && assessmentId.trim() !== '') {
          console.log('🔍 CHECKING DATABASE FOR EXISTING INSIGHTS:', assessmentId);
          
          // For saved assessments, ALWAYS check database first with enhanced validation
          const { data: assessment, error } = await supabase
            .from('assessment_results')
            .select('ai_insights')
            .eq('id', assessmentId)
            .single();

          console.log('🔍 DATABASE QUERY RESULT:', { assessment, error });

          if (error) {
            console.error('🔍 ERROR CHECKING FOR EXISTING INSIGHTS:', error);
            // Continue to generate new insights if we can't check existing ones
          } else if (assessment && 
                     assessment.ai_insights && 
                     assessment.ai_insights.trim() !== '' &&
                     assessment.ai_insights.trim() !== 'null' &&
                     assessment.ai_insights.trim() !== 'undefined') {
            
            console.log('🔍 FOUND EXISTING INSIGHTS:', {
              insightsLength: assessment.ai_insights.length,
              isTestAssessment,
              willUseExisting: true
            });
            
            setInsights(assessment.ai_insights);
            if (!isTestAssessment) {
              insightsLoadedRef.current = true; // Mark as loaded to prevent future operations for non-test assessments
              console.log('🔍 MARKED INSIGHTS AS PERMANENTLY LOADED (NON-TEST)');
            }
            return; // CRITICAL: Exit early - don't generate new insights
          } else {
            console.log('🔍 NO VALID EXISTING INSIGHTS FOUND');
          }
        }

        // Only generate new insights if none exist and we're not already generating
        if (!isGeneratingRef.current && (!insightsLoadedRef.current || isTestAssessment)) {
          console.log('🔍 GENERATING NEW INSIGHTS:', {
            isGeneratingRef: isGeneratingRef.current,
            insightsLoadedRef: insightsLoadedRef.current,
            isTestAssessment
          });
          await generateNewInsights();
        } else {
          console.log('🔍 SKIPPING INSIGHTS GENERATION:', {
            isGeneratingRef: isGeneratingRef.current,
            insightsLoadedRef: insightsLoadedRef.current,
            isTestAssessment
          });
        }
        
      } catch (err) {
        console.error('🔍 ERROR IN checkForExistingInsights:', err);
        setError(err instanceof Error ? err.message : 'Failed to check for existing insights');
      }
    };

    checkForExistingInsights();
  }, [assessmentId, regenerateTrigger, forceRegenerate]); // CRITICAL: Include forceRegenerate in dependencies

  const generateNewInsights = async (skipAllChecks = false) => {
    console.log('🔍 GENERATE NEW INSIGHTS CALLED:', {
      skipAllChecks,
      isGeneratingRef: isGeneratingRef.current,
      insightsLoadedRef: insightsLoadedRef.current,
      isTestAssessment,
      categoriesLength: categories?.length || 0
    });

    // PROTECTION: Prevent simultaneous generation
    if (isGeneratingRef.current && !skipAllChecks) {
      console.log('🔍 ALREADY GENERATING - Preventing duplicate generation');
      return;
    }

    // PROTECTION: Never generate if insights are already loaded (except for test assessment with force regenerate)
    if (insightsLoadedRef.current && !isTestAssessment && !skipAllChecks) {
      console.log('🔍 INSIGHTS ALREADY LOADED (NON-TEST) - Preventing regeneration');
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('🔍 NO CATEGORIES FOR GENERATION - Exiting');
      return;
    }

    console.log('🔍 STARTING INSIGHT GENERATION:', {
      isTestAssessment,
      skipAllChecks,
      assessmentId
    });
    
    isGeneratingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const forceRegenerateFlag = skipAllChecks || (isTestAssessment && forceRegenerate);
      console.log('🔍 CALLING SUPABASE FUNCTION WITH:', {
        categoriesLength: categories.length,
        demographicsKeys: Object.keys(demographics),
        averageGap,
        assessmentId,
        forceRegenerate: forceRegenerateFlag
      });
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories,
          demographics,
          averageGap,
          assessmentId,
          forceRegenerate: forceRegenerateFlag
        }
      });

      console.log('🔍 SUPABASE FUNCTION RESPONSE:', { data, functionError });

      if (functionError) {
        console.error('🔍 FUNCTION ERROR:', functionError);
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        console.log('🔍 RECEIVED NEW INSIGHTS:', {
          insightsLength: data.insights.length,
          isTestAssessment
        });
        
        setInsights(data.insights);
        // Only mark as permanently loaded for non-test assessments
        if (!isTestAssessment) {
          insightsLoadedRef.current = true; // Mark as loaded to prevent future operations
          console.log('🔍 MARKED AS PERMANENTLY LOADED (NON-TEST)');
        } else {
          console.log('🔍 TEST ASSESSMENT - Not marking as permanently loaded');
        }
      } else {
        console.error('🔍 NO INSIGHTS IN RESPONSE');
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      console.error('🔍 ERROR GENERATING INSIGHTS:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
      isGeneratingRef.current = false;
      console.log('🔍 GENERATION COMPLETE - Reset isGeneratingRef');
    }
  };

  return {
    insights,
    isLoading,
    error,
    // Provide a manual regenerate function with special handling for test assessment
    regenerateInsights: () => {
      console.log('🔍 🚨 REGENERATE INSIGHTS BUTTON HANDLER CALLED - FIRST LINE OF FUNCTION!');
      console.log('🔍 REGENERATE INSIGHTS BUTTON CLICKED:', {
        isTestAssessment,
        assessmentId,
        currentInsights: !!insights,
        currentForceRegenerate: forceRegenerate
      });
      
      if (isTestAssessment) {
        console.log('🔍 TEST ASSESSMENT - Setting forceRegenerate=true');
        // CRITICAL FIX: Set force regenerate flag to trigger immediate regeneration
        setForceRegenerate(true);
        console.log('🔍 FORCE REGENERATE STATE SET TO TRUE');
        
        setRegenerateTrigger(prev => {
          const newValue = prev + 1;
          console.log('🔍 REGENERATE TRIGGER INCREMENTED:', { from: prev, to: newValue });
          return newValue;
        });
      } else {
        console.log('🔍 NON-TEST ASSESSMENT - Manual regeneration for new assessments');
        // Reset the loaded flag only for manual regeneration of non-test assessments
        insightsLoadedRef.current = false;
        hasCheckedExistingRef.current = false;
        generateNewInsights();
      }
    }
  };
};

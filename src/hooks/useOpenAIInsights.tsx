
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

  // CRITICAL SAFEGUARD: Check for existing insights first and NEVER regenerate if they exist
  useEffect(() => {
    const checkForExistingInsights = async () => {
      // PROTECTION: Prevent multiple simultaneous checks
      if (hasCheckedExistingRef.current || isGeneratingRef.current) {
        console.log('CRITICAL PROTECTION: Already checked or generating - preventing duplicate operation');
        return;
      }

      // Only proceed if we have valid data
      if (!categories || categories.length === 0) {
        console.log('useOpenAIInsights: No categories available for insights');
        return;
      }

      console.log('CRITICAL SAFEGUARD: Checking for existing insights for assessment:', assessmentId);
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
            
            console.log('CRITICAL PROTECTION: Found existing insights - using saved version - NEVER regenerating');
            console.log('CRITICAL PROTECTION: Insights length:', assessment.ai_insights.length);
            setInsights(assessment.ai_insights);
            return; // CRITICAL: Exit early - don't generate new insights
          }
        }

        // Only generate new insights if none exist and we're not already generating
        if (!isGeneratingRef.current) {
          console.log('CRITICAL SAFEGUARD: No existing insights found, generating new ones (ONLY ONCE)');
          await generateNewInsights();
        }
        
      } catch (err) {
        console.error('useOpenAIInsights: Error in checkForExistingInsights:', err);
        setError(err instanceof Error ? err.message : 'Failed to check for existing insights');
      }
    };

    checkForExistingInsights();
  }, [assessmentId, categories]); // Only depend on assessmentId and categories

  const generateNewInsights = async () => {
    // PROTECTION: Prevent simultaneous generation
    if (isGeneratingRef.current) {
      console.log('CRITICAL PROTECTION: Already generating insights - preventing duplicate generation');
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('useOpenAIInsights: No categories available for insights generation');
      return;
    }

    console.log('CRITICAL SAFEGUARD: Starting insight generation with protection flags');
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
        console.log('CRITICAL SUCCESS: Successfully received and stored AI insights permanently');
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
    // Provide a manual regenerate function for future use (but with protections)
    regenerateInsights: () => {
      console.log('CRITICAL WARNING: Manual regeneration requested - this should only be used for new assessments');
      generateNewInsights();
    }
  };
};

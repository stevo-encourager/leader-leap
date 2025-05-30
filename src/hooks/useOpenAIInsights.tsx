
import { useState, useEffect } from 'react';
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
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false);

  // CRITICAL: Check for existing insights first and NEVER regenerate if they exist
  useEffect(() => {
    const checkForExistingInsights = async () => {
      // Don't check multiple times for the same assessment
      if (hasCheckedExisting) {
        return;
      }

      // Only proceed if we have valid data
      if (!categories || categories.length === 0) {
        console.log('useOpenAIInsights: No categories available for insights');
        return;
      }

      console.log('useOpenAIInsights: Checking for existing insights for assessment:', assessmentId);

      try {
        if (assessmentId) {
          // For saved assessments, ALWAYS check database first
          const { data: assessment, error } = await supabase
            .from('assessment_results')
            .select('ai_insights')
            .eq('id', assessmentId)
            .single();

          if (error) {
            console.error('useOpenAIInsights: Error checking for existing insights:', error);
            // Continue to generate new insights if we can't check existing ones
          } else if (assessment && assessment.ai_insights && assessment.ai_insights.trim()) {
            console.log('useOpenAIInsights: Found existing insights, using saved version - NEVER regenerating');
            setInsights(assessment.ai_insights);
            setHasCheckedExisting(true);
            return; // Exit early - don't generate new insights
          }
        }

        // Only generate new insights if none exist
        console.log('useOpenAIInsights: No existing insights found, generating new ones (ONLY ONCE)');
        await generateNewInsights();
        
      } catch (err) {
        console.error('useOpenAIInsights: Error in checkForExistingInsights:', err);
        setError(err instanceof Error ? err.message : 'Failed to check for existing insights');
      } finally {
        setHasCheckedExisting(true);
      }
    };

    checkForExistingInsights();
  }, [assessmentId, categories]); // Only depend on assessmentId and categories

  const generateNewInsights = async () => {
    if (!categories || categories.length === 0) {
      console.log('useOpenAIInsights: No categories available for insights generation');
      return;
    }

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
        console.log('useOpenAIInsights: Successfully received and stored AI insights permanently');
      } else {
        throw new Error('No insights received from EncouragerGPT');
      }
    } catch (err) {
      console.error('useOpenAIInsights: Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    insights,
    isLoading,
    error,
    // Provide a manual regenerate function for future use
    regenerateInsights: generateNewInsights
  };
};

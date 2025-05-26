
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

  const generateInsights = async () => {
    if (!categories || categories.length === 0) {
      console.log('No categories available for insights generation');
      return;
    }

    // If we already have insights, don't generate new ones
    if (insights && insights.trim()) {
      console.log('Insights already exist, not regenerating');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling generate-insights function with assessmentId:', assessmentId);
      
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
        console.log('Successfully received AI insights (will be saved permanently)');
      } else {
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing insights first, then generate if needed
  useEffect(() => {
    const checkForExistingInsights = async () => {
      // Only check if we have an assessmentId and valid data
      if (!assessmentId || !categories || categories.length === 0) {
        return;
      }

      try {
        console.log('Checking for existing insights for assessment:', assessmentId);
        
        const { data: assessment, error } = await supabase
          .from('assessment_results')
          .select('ai_insights')
          .eq('id', assessmentId)
          .single();

        if (error) {
          console.error('Error checking for existing insights:', error);
          return;
        }

        if (assessment && assessment.ai_insights && assessment.ai_insights.trim()) {
          console.log('Found existing insights, using saved version');
          setInsights(assessment.ai_insights);
          return; // Don't generate new insights
        }

        // Only generate if no existing insights found
        console.log('No existing insights found, generating new ones');
        generateInsights();
      } catch (err) {
        console.error('Error checking for existing insights:', err);
        // Fallback to generating new insights
        generateInsights();
      }
    };

    // For assessments with IDs, check for existing insights first
    if (assessmentId) {
      checkForExistingInsights();
    } 
    // For new assessments without IDs, generate insights immediately
    else if (categories && categories.length > 0 && averageGap !== undefined) {
      generateInsights();
    }
  }, [assessmentId]); // Only depend on assessmentId to prevent regeneration

  return {
    insights,
    isLoading,
    error
  };
};


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
        console.log('Successfully received AI insights');
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

  // Auto-generate insights when component mounts with valid data
  useEffect(() => {
    if (categories && categories.length > 0 && averageGap !== undefined) {
      generateInsights();
    }
  }, [categories, demographics, averageGap, assessmentId]);

  return {
    insights,
    isLoading,
    error
    // Removed regenerateInsights function - no longer available
  };
};

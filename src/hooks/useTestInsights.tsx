
import { useState, useEffect } from 'react';

interface UseTestInsightsProps {
  testInsights?: string | null;
}

export const useTestInsights = ({ testInsights }: UseTestInsightsProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testInsights) {
      setInsights(testInsights);
      setIsLoading(false);
      setError(null);
    }
  }, [testInsights]);

  return {
    insights,
    isLoading,
    error
  };
};

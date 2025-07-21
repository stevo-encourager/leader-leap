import React, { createContext, useContext } from 'react';
import { useOpenAIInsights } from './useOpenAIInsights';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface InsightsContextValue {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
  regenerateInsights: () => Promise<void>;
}

const InsightsContext = createContext<InsightsContextValue | undefined>(undefined);

interface InsightsProviderProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
  children: React.ReactNode;
}

export const InsightsProvider: React.FC<InsightsProviderProps> = ({
  categories,
  demographics,
  averageGap,
  assessmentId,
  children
}) => {
  const { insights, isLoading, error, regenerateInsights } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  return (
    <InsightsContext.Provider value={{ insights, isLoading, error, regenerateInsights }}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
}; 
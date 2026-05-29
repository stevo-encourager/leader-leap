
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { ResultsDashboard } from '@/components/ResultsDashboard';

interface ResultsDisplayProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup?: () => void;
  isAuthenticated: boolean;
  assessmentId?: string;
  shouldGenerateInsights?: boolean;
  assessmentDate?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  categories,
  demographics,
  onRestart,
  onBack,
  onSignup,
  isAuthenticated,
  assessmentId,
  shouldGenerateInsights = true,
  assessmentDate
}) => {
  return (
    <ResultsDashboard 
      categories={categories}
      demographics={demographics}
      assessmentId={assessmentId}
      shouldGenerateInsights={shouldGenerateInsights}
      assessmentDate={assessmentDate}
    />
  );
};

export default ResultsDisplay;

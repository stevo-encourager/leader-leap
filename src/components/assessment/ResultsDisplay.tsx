
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import ResultsDashboard from '@/components/ResultsDashboard';

interface ResultsDisplayProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup?: () => void;
  isAuthenticated: boolean;
  assessmentId?: string; // Add this prop to receive the assessment ID
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  categories,
  demographics,
  onRestart,
  onBack,
  onSignup,
  isAuthenticated,
  assessmentId // Receive the assessment ID
}) => {
  return (
    <ResultsDashboard
      categories={categories}
      demographics={demographics}
      onRestart={onRestart}
      onBack={onBack}
      onSignup={!isAuthenticated ? onSignup : undefined}
      assessmentId={assessmentId} // Pass it to ResultsDashboard
    />
  );
};

export default ResultsDisplay;

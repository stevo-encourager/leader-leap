
import React, { useEffect } from 'react';
import ResultsDashboard from '../ResultsDashboard';
import { Category, Demographics } from '../../utils/assessmentTypes';
import { normalizeCategories } from '../../utils/resultNormalizer';
import InvalidResultsMessage from './InvalidResultsMessage';

interface ResultsDisplayProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup: () => void;
  isAuthenticated: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  categories,
  demographics,
  onRestart,
  onBack,
  onSignup,
  isAuthenticated
}) => {
  useEffect(() => {
    console.log("ResultsDisplay - Categories received:", categories);
  }, [categories]);

  // Check if categories is valid before rendering
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Normalize the categories data
  const normalizedCategories = normalizeCategories(categories);

  return (
    <ResultsDashboard 
      categories={normalizedCategories}
      demographics={demographics || {}}
      onRestart={onRestart}
      onBack={onBack}
      onSignup={!isAuthenticated ? onSignup : undefined}
    />
  );
};

export default ResultsDisplay;

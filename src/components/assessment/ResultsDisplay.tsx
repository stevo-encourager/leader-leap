
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
    if (categories && Array.isArray(categories)) {
      console.log("ResultsDisplay - Categories length:", categories.length);
    } else {
      console.log("ResultsDisplay - Categories not valid array");
    }
  }, [categories]);

  // Check if categories is valid before rendering
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.log("ResultsDisplay - Invalid categories data, showing error message");
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Normalize the categories data
  const normalizedCategories = normalizeCategories(categories);
  console.log("ResultsDisplay - Normalized categories:", normalizedCategories);

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

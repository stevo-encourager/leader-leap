
import React from 'react';
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
  // Quick validation of input data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Normalize the categories data to ensure consistent format
  const normalizedCategories = normalizeCategories(categories);
  
  // Check for valid normalized data
  if (!normalizedCategories || normalizedCategories.length === 0) {
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

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


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
  // Log categories for debugging
  useEffect(() => {
    console.log("ResultsDisplay - Raw categories:", categories);
    console.log("ResultsDisplay - Categories type:", Array.isArray(categories) ? "Array" : typeof categories);
    console.log("ResultsDisplay - Categories length:", Array.isArray(categories) ? categories.length : 0);
  }, [categories]);

  // Quick validation of input data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.warn("ResultsDisplay - Invalid categories data:", categories);
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Normalize the categories data to ensure consistent format
  const normalizedCategories = normalizeCategories(categories);
  
  // Log normalized categories
  console.log("ResultsDisplay - Normalized categories:", normalizedCategories);
  console.log("ResultsDisplay - Normalized categories length:", normalizedCategories?.length || 0);
  
  // Check for valid normalized data
  if (!normalizedCategories || normalizedCategories.length === 0) {
    console.warn("ResultsDisplay - Normalization failed to produce valid categories");
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Additional validation for skills
  const hasValidSkills = normalizedCategories.some(
    cat => cat.skills && Array.isArray(cat.skills) && cat.skills.length > 0
  );
  
  if (!hasValidSkills) {
    console.warn("ResultsDisplay - No valid skills found in normalized categories");
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

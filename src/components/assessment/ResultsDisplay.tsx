
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
    console.log("RESULTS_DISPLAY - Categories received:", categories);
    
    // Debug category ratings
    if (categories && categories.length > 0) {
      console.log(`RESULTS_DISPLAY - First category: ${categories[0].title}`);
      if (categories[0].skills && categories[0].skills.length > 0) {
        console.log(`RESULTS_DISPLAY - First skill: ${categories[0].skills[0].name}`);
        console.log(`RESULTS_DISPLAY - First skill ratings:`, categories[0].skills[0].ratings);
      }
    }
  }, [categories]);

  // Check if categories is valid before rendering
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.error("RESULTS_DISPLAY - Invalid categories data received");
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Normalize the categories data
  const normalizedCategories = normalizeCategories(categories);
  
  // Confirm data after normalization
  console.log("RESULTS_DISPLAY - Categories after normalization:", normalizedCategories.length);
  if (normalizedCategories.length > 0 && normalizedCategories[0].skills.length > 0) {
    console.log("RESULTS_DISPLAY - First normalized skill ratings:", 
      normalizedCategories[0].skills[0].ratings);
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


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
    console.log("RESULTS_DISPLAY - INITIAL Categories received:", JSON.stringify(categories));
    
    // Debug category ratings
    if (categories && categories.length > 0) {
      console.log(`RESULTS_DISPLAY - First category: ${categories[0].title}`);
      if (categories[0].skills && categories[0].skills.length > 0) {
        const firstSkill = categories[0].skills[0];
        console.log(`RESULTS_DISPLAY - First skill: ${firstSkill.name}`);
        console.log(`RESULTS_DISPLAY - First skill ratings:`, firstSkill.ratings);
        console.log(`RESULTS_DISPLAY - First skill ratings type:`, typeof firstSkill.ratings);
        if (firstSkill.ratings) {
          console.log(`RESULTS_DISPLAY - Current rating type: ${typeof firstSkill.ratings.current}`);
          console.log(`RESULTS_DISPLAY - Desired rating type: ${typeof firstSkill.ratings.desired}`);
        }
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
  console.log("RESULTS_DISPLAY - Full normalized categories:", JSON.stringify(normalizedCategories));
  
  if (normalizedCategories.length > 0 && normalizedCategories[0].skills.length > 0) {
    console.log("RESULTS_DISPLAY - First normalized skill ratings:", 
      normalizedCategories[0].skills[0].ratings);
    console.log("RESULTS_DISPLAY - First normalized skill ratings type:", 
      typeof normalizedCategories[0].skills[0].ratings);
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


import React, { useEffect } from 'react';
import ResultsDashboard from '../ResultsDashboard';
import { Category, Demographics } from '../../utils/assessmentTypes';
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
  // Debug logging for the incoming data
  useEffect(() => {
    console.log("ResultsDisplay - Categories:", categories);
    console.log("ResultsDisplay - Categories length:", categories?.length || 0);
    console.log("ResultsDisplay - First category sample:", categories && categories.length > 0 ? categories[0] : "none");
    
    // Check if we have any ratings data
    if (categories && categories.length > 0) {
      const hasAnyRatings = categories.some(category => 
        category.skills && category.skills.some(skill => 
          skill.ratings && (
            (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
            (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
          )
        )
      );
      
      console.log("ResultsDisplay - Has any ratings data:", hasAnyRatings);
    }
  }, [categories]);

  // Basic validation of input data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.warn("ResultsDisplay - Invalid categories data:", categories);
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  return (
    <ResultsDashboard 
      categories={categories}
      demographics={demographics || {}}
      onRestart={onRestart}
      onBack={onBack}
      onSignup={!isAuthenticated ? onSignup : undefined}
    />
  );
};

export default ResultsDisplay;

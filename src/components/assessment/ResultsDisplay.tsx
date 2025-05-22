
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
    console.log("ResultsDisplay - Demographics:", demographics);
    
    // Check if we have valid categories data
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.warn("ResultsDisplay - Invalid or empty categories data");
      return;
    }
    
    // Check if we have any valid ratings data in the categories
    const hasValidRatings = categories.some(category => 
      category.skills && category.skills.some(skill => 
        skill.ratings && (
          (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
          (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
        )
      )
    );
    
    console.log("ResultsDisplay - Has valid ratings data:", hasValidRatings);
    
    // Log first category as a sample
    if (categories && categories.length > 0) {
      console.log("ResultsDisplay - First category sample:", categories[0]);
      if (categories[0].skills && categories[0].skills.length > 0) {
        console.log("ResultsDisplay - First skill sample:", categories[0].skills[0]);
      }
    }
  }, [categories, demographics]);

  // Validate incoming data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.warn("ResultsDisplay - Invalid categories data:", categories);
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Check if we have any valid ratings
  const hasValidRatings = categories.some(category => 
    category.skills && category.skills.some(skill => 
      skill.ratings && (
        (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
        (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
      )
    )
  );
  
  if (!hasValidRatings) {
    console.warn("ResultsDisplay - No valid ratings found in categories");
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

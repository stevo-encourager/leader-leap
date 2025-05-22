
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
  // Enhanced debug logging for the incoming data
  useEffect(() => {
    console.log("ResultsDisplay - Categories:", categories);
    console.log("ResultsDisplay - Categories length:", categories?.length || 0);
    console.log("ResultsDisplay - Demographics:", demographics);
    
    // Log first category as a sample if available
    if (categories && categories.length > 0) {
      console.log("ResultsDisplay - First category sample:", categories[0]);
      
      const firstCategory = categories[0];
      if (firstCategory && firstCategory.skills && firstCategory.skills.length > 0) {
        console.log("ResultsDisplay - First skill sample:", firstCategory.skills[0]);
        
        const firstSkill = firstCategory.skills[0];
        if (firstSkill && firstSkill.ratings) {
          console.log("ResultsDisplay - First skill ratings:", firstSkill.ratings);
        }
      }
    }
    
    // Check if there are any valid ratings in the data
    if (categories && Array.isArray(categories)) {
      let totalRatings = 0;
      categories.forEach(category => {
        if (!category || !category.skills) return;
        
        category.skills.forEach(skill => {
          if (!skill || !skill.ratings) return;
          
          if (typeof skill.ratings.current === 'number' && !isNaN(skill.ratings.current)) {
            totalRatings++;
          }
          if (typeof skill.ratings.desired === 'number' && !isNaN(skill.ratings.desired)) {
            totalRatings++;
          }
        });
      });
      
      console.log(`ResultsDisplay - Found a total of ${totalRatings} valid ratings in the data`);
    }
  }, [categories, demographics]);

  // Base-level validation
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.warn("ResultsDisplay - Invalid categories data:", categories);
    return <InvalidResultsMessage onRestart={onRestart} onBack={onBack} errorType="missing-categories" />;
  }

  // More lenient validation approach
  let hasAnyValidData = false;
  
  // Look for any categories that have skills with ratings
  for (const category of categories) {
    if (!category || !category.skills || !Array.isArray(category.skills)) continue;
    
    for (const skill of category.skills) {
      if (skill && skill.ratings && 
         (typeof skill.ratings.current === 'number' || typeof skill.ratings.desired === 'number')) {
        hasAnyValidData = true;
        break;
      }
    }
    
    if (hasAnyValidData) break;
  }
  
  if (!hasAnyValidData) {
    console.warn("ResultsDisplay - No valid skills with ratings found");
    return <InvalidResultsMessage onRestart={onRestart} onBack={onBack} errorType="invalid-format" />;
  }

  // If we've passed the validations, render the dashboard
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

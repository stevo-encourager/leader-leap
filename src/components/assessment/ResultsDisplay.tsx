
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
    
    // Check if we have valid categories data
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.warn("ResultsDisplay - Invalid or empty categories data");
      return;
    }
    
    // More detailed validation logging
    const validationResults = {
      hasCategoriesArray: Array.isArray(categories),
      categoriesLength: categories?.length || 0,
      categoriesWithSkills: categories?.filter(c => Array.isArray(c.skills) && c.skills.length > 0).length || 0,
      totalSkills: categories?.reduce((count, cat) => count + (Array.isArray(cat.skills) ? cat.skills.length : 0), 0) || 0,
      skillsWithRatings: categories?.reduce((count, cat) => {
        if (!Array.isArray(cat.skills)) return count;
        return count + cat.skills.filter(s => 
          s.ratings && 
          (typeof s.ratings.current === 'number' || typeof s.ratings.desired === 'number')
        ).length;
      }, 0) || 0
    };
    
    console.log("ResultsDisplay - Validation details:", validationResults);
    
    // Log first category as a sample
    if (categories && categories.length > 0) {
      console.log("ResultsDisplay - First category sample:", categories[0]);
      if (categories[0].skills && categories[0].skills.length > 0) {
        console.log("ResultsDisplay - First skill sample:", categories[0].skills[0]);
        if (categories[0].skills[0].ratings) {
          console.log("ResultsDisplay - First rating sample:", categories[0].skills[0].ratings);
        }
      }
    }
  }, [categories, demographics]);

  // Enhanced validation for incoming data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.warn("ResultsDisplay - Critical: Invalid categories data:", categories);
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // Check for categories with skills
  const categoriesWithSkills = categories.filter(cat => 
    Array.isArray(cat.skills) && cat.skills.length > 0
  );
  
  if (categoriesWithSkills.length === 0) {
    console.warn("ResultsDisplay - Critical: No categories with skills found");
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
    console.warn("ResultsDisplay - Critical: No valid ratings found in categories");
    return <InvalidResultsMessage onRestart={onRestart} />;
  }

  // If we've passed all validations, render the dashboard
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

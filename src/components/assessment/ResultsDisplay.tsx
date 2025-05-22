
import React, { useEffect, useState } from 'react';
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
  const [validatedCategories, setValidatedCategories] = useState<Category[]>([]);

  // Enhanced validation and debug logging for the incoming data
  useEffect(() => {
    console.log("ResultsDisplay - Categories:", categories);
    console.log("ResultsDisplay - Categories length:", categories?.length || 0);
    console.log("ResultsDisplay - Demographics:", demographics);
    
    // Total validation count
    let totalRatings = 0;
    let validCategoriesCount = 0;
    let validSkillsCount = 0;

    // Validate and clean categories data
    const cleanCategories = categories.map(category => {
      if (!category || !category.skills) {
        console.log("ResultsDisplay - Invalid category (null or no skills):", category);
        return null;
      }
      
      // Filter for valid skills with non-zero ratings
      const validSkills = category.skills.filter(skill => {
        if (!skill || !skill.ratings) return false;
        
        const current = typeof skill.ratings.current === 'number' 
          ? skill.ratings.current 
          : parseFloat(String(skill.ratings.current || '0'));
          
        const desired = typeof skill.ratings.desired === 'number' 
          ? skill.ratings.desired 
          : parseFloat(String(skill.ratings.desired || '0'));
        
        if (isNaN(current) || isNaN(desired)) {
          console.log(`ResultsDisplay - Skill with NaN ratings: ${skill.name}`, skill.ratings);
          return false;
        }
        
        // Count if either rating is non-zero
        const isValid = current > 0 || desired > 0;
        if (isValid) {
          totalRatings += 2; // Count both ratings
          validSkillsCount++;
          console.log(`ResultsDisplay - Valid skill: ${skill.name}, current=${current}, desired=${desired}`);
        } else {
          console.log(`ResultsDisplay - Skill with zero ratings: ${skill.name}`, skill.ratings);
        }
        
        return isValid;
      });
      
      if (validSkills.length > 0) {
        validCategoriesCount++;
        return {
          ...category,
          skills: validSkills
        };
      }
      
      console.log(`ResultsDisplay - Category ${category.title} has no valid skills`);
      return null;
    }).filter(Boolean) as Category[];
    
    console.log(`ResultsDisplay - Found ${totalRatings} valid rating values across ${validSkillsCount} skills in ${validCategoriesCount} categories`);
    console.log("ResultsDisplay - Cleaned categories:", cleanCategories);
    
    setValidatedCategories(cleanCategories);
  }, [categories]);

  // Base-level validation
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.warn("ResultsDisplay - Invalid categories data:", categories);
    return <InvalidResultsMessage onRestart={onRestart} onBack={onBack} errorType="missing-categories" />;
  }

  // More lenient validation approach
  let hasAnyValidData = false;
  
  // Look for any categories that have skills with ratings
  for (const category of validatedCategories) {
    if (!category || !category.skills || !Array.isArray(category.skills)) continue;
    
    for (const skill of category.skills) {
      if (skill && skill.ratings) {
        const current = typeof skill.ratings.current === 'number' 
          ? skill.ratings.current 
          : parseFloat(String(skill.ratings.current || '0'));
          
        const desired = typeof skill.ratings.desired === 'number' 
          ? skill.ratings.desired 
          : parseFloat(String(skill.ratings.desired || '0'));
        
        if (!isNaN(current) && !isNaN(desired) && (current > 0 || desired > 0)) {
          console.log(`ResultsDisplay - Found valid data: ${skill.name}, current=${current}, desired=${desired}`);
          hasAnyValidData = true;
          break;
        }
      }
    }
    
    if (hasAnyValidData) break;
  }
  
  if (!hasAnyValidData) {
    console.warn("ResultsDisplay - No valid skills with ratings found");
    return <InvalidResultsMessage onRestart={onRestart} onBack={onBack} errorType="invalid-format" />;
  }

  // If we've passed the validations, render the dashboard with the cleaned data
  return (
    <ResultsDashboard 
      categories={validatedCategories}
      demographics={demographics || {}}
      onRestart={onRestart}
      onBack={onBack}
      onSignup={!isAuthenticated ? onSignup : undefined}
    />
  );
};

export default ResultsDisplay;

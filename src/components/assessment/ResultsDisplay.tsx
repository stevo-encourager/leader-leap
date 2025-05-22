
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
  const [errorType, setErrorType] = useState<string | null>(null);

  // Enhanced validation and debug logging for the incoming data
  useEffect(() => {
    console.log("ResultsDisplay - Categories:", JSON.stringify(categories));
    console.log("ResultsDisplay - Categories length:", categories?.length || 0);
    console.log("ResultsDisplay - Demographics:", demographics);
    
    // First-level validation
    if (!categories || !Array.isArray(categories)) {
      console.warn("ResultsDisplay - Invalid categories data:", categories);
      setErrorType("missing-categories");
      return;
    }
    
    if (categories.length === 0) {
      console.warn("ResultsDisplay - Empty categories array");
      setErrorType("missing-categories");
      return;
    }
    
    // Total validation count
    let totalRatings = 0;
    let validCategoriesCount = 0;
    let validSkillsCount = 0;

    // Validate and clean categories data
    const cleanCategories = categories.filter(category => {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        console.log("ResultsDisplay - Invalid category (null or no skills):", category);
        return false;
      }
      
      // Filter for valid skills with non-zero ratings
      const validSkills = category.skills.filter(skill => {
        if (!skill || !skill.ratings) return false;
        
        // Parse and verify ratings
        let current = 0;
        let desired = 0;
        
        // Handle current rating
        if (typeof skill.ratings.current === 'number') {
          current = skill.ratings.current;
        } else if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
          try {
            current = parseFloat(String(skill.ratings.current));
          } catch (e) {
            console.warn(`ResultsDisplay - Error parsing current rating for ${skill.name}:`, e);
          }
        }
        
        // Handle desired rating
        if (typeof skill.ratings.desired === 'number') {
          desired = skill.ratings.desired;
        } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
          try {
            desired = parseFloat(String(skill.ratings.desired));
          } catch (e) {
            console.warn(`ResultsDisplay - Error parsing desired rating for ${skill.name}:`, e);
          }
        }
        
        current = isNaN(current) ? 0 : current;
        desired = isNaN(desired) ? 0 : desired;
        
        // Update the skill with cleaned values
        skill.ratings.current = current;
        skill.ratings.desired = desired;
        
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
        category.skills = validSkills;
        return true;
      }
      
      console.log(`ResultsDisplay - Category ${category.title} has no valid skills`);
      return false;
    });
    
    console.log(`ResultsDisplay - Found ${totalRatings} valid rating values across ${validSkillsCount} skills in ${validCategoriesCount} categories`);
    
    if (cleanCategories.length === 0) {
      console.warn("ResultsDisplay - No valid categories with skills found");
      setErrorType("invalid-format");
      return;
    }
    
    console.log("ResultsDisplay - Cleaned categories:", JSON.stringify(cleanCategories));
    
    // Set the validated categories
    setValidatedCategories(cleanCategories);
    // Clear any previous error
    setErrorType(null);
  }, [categories]);

  // If we have an error, show the error message
  if (errorType) {
    console.warn(`ResultsDisplay - Showing error message: ${errorType}`);
    return <InvalidResultsMessage onRestart={onRestart} onBack={onBack} errorType={errorType} />;
  }

  // If we have valid categories, show the results dashboard
  if (validatedCategories.length > 0) {
    console.log(`ResultsDisplay - Showing results dashboard with ${validatedCategories.length} categories`);
    return (
      <ResultsDashboard 
        categories={validatedCategories}
        demographics={demographics || {}}
        onRestart={onRestart}
        onBack={onBack}
        onSignup={!isAuthenticated ? onSignup : undefined}
      />
    );
  }

  // Loading or waiting for validation
  console.log("ResultsDisplay - Waiting for validation");
  return <InvalidResultsMessage onRestart={onRestart} onBack={onBack} errorType="loading" />;
};

export default ResultsDisplay;

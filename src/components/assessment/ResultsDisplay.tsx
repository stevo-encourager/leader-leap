
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
  const [debugData, setDebugData] = useState<any>(null);

  // Enhanced validation and debug logging for the incoming data
  useEffect(() => {
    console.log("ResultsDisplay - RECEIVED props.categories:", categories);
    
    const debugInfo: any = {
      categoriesInput: {
        type: typeof categories,
        isArray: Array.isArray(categories),
        length: categories?.length || 0,
        rawData: categories ? JSON.parse(JSON.stringify(categories)) : null
      },
      demographicsInput: demographics ? { ...demographics } : null,
      timestamp: new Date().toISOString(),
      component: 'ResultsDisplay'
    };
    
    // First-level validation
    if (!categories || !Array.isArray(categories)) {
      console.error("ResultsDisplay - Invalid categories data:", categories);
      setErrorType("missing-categories");
      setDebugData({
        ...debugInfo,
        error: "Categories is not an array or is undefined/null"
      });
      return;
    }
    
    if (categories.length === 0) {
      console.error("ResultsDisplay - Empty categories array");
      setErrorType("missing-categories");
      setDebugData({
        ...debugInfo,
        error: "Categories array is empty"
      });
      return;
    }
    
    // Total validation count
    let totalRatings = 0;
    let validCategoriesCount = 0;
    let validSkillsCount = 0;
    let invalidSkillsCount = 0;
    let categoriesWithValidSkills = 0;
    let validationErrors: string[] = [];
    
    console.log("ResultsDisplay - Starting to validate", categories.length, "categories");

    // Validate and clean categories data
    const cleanCategories = categories.filter(category => {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        validationErrors.push(`Invalid category (null or no skills): ${category?.title || 'unknown'}`);
        console.error("ResultsDisplay - Invalid category (null or no skills):", category);
        return false;
      }
      
      console.log(`ResultsDisplay - Validating category: ${category.title} with ${category.skills.length} skills`);
      
      // Filter for valid skills with non-zero ratings
      const validSkills = category.skills.filter(skill => {
        if (!skill || !skill.ratings) {
          invalidSkillsCount++;
          console.error(`ResultsDisplay - Invalid skill (null or no ratings): ${skill?.name || 'unknown'} in category ${category.title}`);
          return false;
        }
        
        // Ensure ratings are parsed as numbers
        let current = 0;
        let desired = 0;
        
        // Handle current rating - explicitly convert to number to ensure proper type
        if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
          current = Number(skill.ratings.current);
          if (isNaN(current)) {
            console.warn(`ResultsDisplay - Invalid current rating for ${skill.name}, value: ${skill.ratings.current}`);
            current = 0;
          }
        }
        
        // Handle desired rating - explicitly convert to number to ensure proper type
        if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
          desired = Number(skill.ratings.desired);
          if (isNaN(desired)) {
            console.warn(`ResultsDisplay - Invalid desired rating for ${skill.name}, value: ${skill.ratings.desired}`);
            desired = 0;
          }
        }
        
        // Update the skill with cleaned numeric values
        skill.ratings.current = current;
        skill.ratings.desired = desired;
        
        // Log all ratings for debugging
        console.log(`ResultsDisplay - Skill ratings check: ${category.title} -> ${skill.name}: current=${current}, desired=${desired}`);
        
        // Count if either rating is non-zero
        const isValid = current > 0 || desired > 0;
        if (isValid) {
          totalRatings += 2; // Count both ratings
          validSkillsCount++;
          console.log(`ResultsDisplay - Valid skill: ${skill.name}, current=${current}, desired=${desired}`);
        } else {
          invalidSkillsCount++;
          console.warn(`ResultsDisplay - Skill with zero ratings: ${skill.name}`, skill.ratings);
        }
        
        // Include all skills with ratings whether zero or not - we'll filter at render time if needed
        return true;
      });
      
      if (validSkills.length > 0) {
        validCategoriesCount++;
        // Only increment if at least one skill has non-zero ratings
        if (validSkills.some(s => s.ratings.current > 0 || s.ratings.desired > 0)) {
          categoriesWithValidSkills++;
        }
        category.skills = validSkills;
        return true;
      }
      
      validationErrors.push(`Category ${category.title} has no valid skills`);
      console.error(`ResultsDisplay - Category ${category.title} has no valid skills`);
      return false;
    });
    
    console.log(`ResultsDisplay - Found ${totalRatings} valid rating values across ${validSkillsCount} skills in ${validCategoriesCount} categories`);
    
    // Prepare detailed debug data
    debugInfo.validation = {
      validCategoriesCount,
      validSkillsCount,
      invalidSkillsCount,
      totalRatings,
      categoriesWithValidSkills,
      errors: validationErrors
    };
    
    // We'll accept all categories that have skills, even if ratings are zero
    // This allows us to show the structure even if no ratings were provided
    if (cleanCategories.length === 0) {
      console.error("ResultsDisplay - No valid categories with skills found");
      setErrorType("invalid-format");
      setDebugData({
        ...debugInfo,
        error: "No valid categories with skills found after cleaning"
      });
      return;
    }
    
    debugInfo.cleanedCategories = cleanCategories;
    
    // Set the validated categories
    setValidatedCategories(cleanCategories);
    // Clear any previous error and debug data (showing successful processing)
    setErrorType(null);
    setDebugData(debugInfo);
  }, [categories, demographics]);

  // If we have an error, show the error message
  if (errorType) {
    console.error(`ResultsDisplay - Showing error message: ${errorType}`);
    return <InvalidResultsMessage 
             onRestart={onRestart} 
             onBack={onBack} 
             errorType={errorType} 
             debugData={debugData} 
           />;
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
  return <InvalidResultsMessage 
           onRestart={onRestart} 
           onBack={onBack} 
           errorType="loading" 
           debugData={debugData}
         />;
};

export default ResultsDisplay;

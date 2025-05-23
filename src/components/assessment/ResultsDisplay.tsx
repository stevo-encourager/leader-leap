
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);

  // Enhanced validation with better loading state handling
  useEffect(() => {
    console.log("ResultsDisplay - RECEIVED props.categories:", categories);
    
    // Give a brief moment for data to settle before validation
    const validationTimer = setTimeout(() => {
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
      
      // More lenient initial validation
      if (!categories || !Array.isArray(categories)) {
        console.error("ResultsDisplay - Invalid categories data:", categories);
        if (!isInitialLoad) { // Only show error after initial load
          setErrorType("missing-categories");
          setDebugData({
            ...debugInfo,
            error: "Categories is not an array or is undefined/null"
          });
        }
        return;
      }
      
      if (categories.length === 0) {
        console.error("ResultsDisplay - Empty categories array");
        if (!isInitialLoad) { // Only show error after initial load
          setErrorType("missing-categories");
          setDebugData({
            ...debugInfo,
            error: "Categories array is empty"
          });
        }
        return;
      }
      
      // Simplified validation process
      let validCategoriesCount = 0;
      let validationErrors: string[] = [];
      
      console.log("ResultsDisplay - Starting to validate", categories.length, "categories");

      // Clean and validate categories with more lenient approach
      const cleanCategories = categories.filter(category => {
        if (!category || !category.skills || !Array.isArray(category.skills)) {
          validationErrors.push(`Invalid category: ${category?.title || 'unknown'}`);
          return false;
        }
        
        // More lenient skill validation - accept all skills with ratings structure
        const validSkills = category.skills.filter(skill => {
          if (!skill || !skill.ratings) {
            return false;
          }
          
          // Ensure ratings are properly formatted
          let current = 0;
          let desired = 0;
          
          if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
            current = Number(skill.ratings.current);
            if (isNaN(current)) current = 0;
          }
          
          if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
            desired = Number(skill.ratings.desired);
            if (isNaN(desired)) desired = 0;
          }
          
          // Update the skill with cleaned numeric values
          skill.ratings.current = current;
          skill.ratings.desired = desired;
          
          return true; // Accept all skills with ratings structure
        });
        
        if (validSkills.length > 0) {
          validCategoriesCount++;
          category.skills = validSkills;
          return true;
        }
        
        return false;
      });
      
      console.log(`ResultsDisplay - Validated ${validCategoriesCount} categories`);
      
      debugInfo.validation = {
        validCategoriesCount,
        errors: validationErrors
      };
      
      // Accept any categories that have skills structure
      if (cleanCategories.length === 0 && !isInitialLoad) {
        console.error("ResultsDisplay - No valid categories found");
        setErrorType("invalid-format");
        setDebugData({
          ...debugInfo,
          error: "No valid categories found after cleaning"
        });
        return;
      }
      
      if (cleanCategories.length > 0) {
        debugInfo.cleanedCategories = cleanCategories;
        setValidatedCategories(cleanCategories);
        setErrorType(null);
        setDebugData(debugInfo);
      }
      
      setIsInitialLoad(false);
    }, isInitialLoad ? 300 : 100); // Longer delay on initial load

    return () => clearTimeout(validationTimer);
  }, [categories, demographics, isInitialLoad]);

  // Show loading state during initial validation
  if (isInitialLoad && (!categories || categories.length === 0)) {
    console.log("ResultsDisplay - Initial loading state");
    return null; // Return null instead of error message during initial load
  }

  // Show error only after initial load is complete
  if (errorType && !isInitialLoad) {
    console.error(`ResultsDisplay - Showing error message: ${errorType}`);
    return <InvalidResultsMessage 
             onRestart={onRestart} 
             onBack={onBack} 
             errorType={errorType} 
             debugData={debugData} 
           />;
  }

  // Show results if we have valid categories
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

  // Loading state for ongoing validation
  return null;
};

export default ResultsDisplay;

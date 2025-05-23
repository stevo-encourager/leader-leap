
import React, { useEffect, useState } from 'react';
import ResultsDashboard from '../ResultsDashboard';
import { Category, Demographics } from '../../utils/assessmentTypes';
import InvalidResultsMessage from './InvalidResultsMessage';
import AssessmentLoading from './AssessmentLoading';

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
  const [isLoading, setIsLoading] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);

  // Enhanced validation with improved loading state handling
  useEffect(() => {
    console.log("ResultsDisplay - RECEIVED props.categories:", categories);
    
    // Only proceed with validation after a delay to let state settle
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
      
      // Validate categories data structure
      if (!categories || !Array.isArray(categories)) {
        console.error("ResultsDisplay - Invalid categories data:", categories);
        setErrorType("missing-categories");
        setDebugData({
          ...debugInfo,
          error: "Categories is not an array or is undefined/null"
        });
        setIsLoading(false);
        return;
      }
      
      if (categories.length === 0) {
        console.error("ResultsDisplay - Empty categories array");
        setErrorType("missing-categories");
        setDebugData({
          ...debugInfo,
          error: "Categories array is empty"
        });
        setIsLoading(false);
        return;
      }
      
      // Log validation details
      let validCategoriesCount = 0;
      let validationErrors: string[] = [];
      
      console.log("ResultsDisplay - Starting to validate", categories.length, "categories");

      // Process and validate categories
      const cleanCategories = categories.filter(category => {
        if (!category || !category.skills || !Array.isArray(category.skills)) {
          validationErrors.push(`Invalid category: ${category?.title || 'unknown'}`);
          return false;
        }
        
        // Validate skills with ratings
        const validSkills = category.skills.filter(skill => {
          if (!skill || !skill.ratings) {
            return false;
          }
          
          // Normalize ratings to ensure they're numbers
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
      
      // Finalize validation results
      if (cleanCategories.length === 0) {
        console.error("ResultsDisplay - No valid categories found");
        setErrorType("invalid-format");
        setDebugData({
          ...debugInfo,
          error: "No valid categories found after cleaning"
        });
      } else {
        debugInfo.cleanedCategories = cleanCategories;
        setValidatedCategories(cleanCategories);
        setErrorType(null);
        setDebugData(debugInfo);
      }
      
      // Always set loading to false when validation completes
      setIsLoading(false);
    }, 500); // Use a consistent delay to allow for data to settle

    return () => clearTimeout(validationTimer);
  }, [categories, demographics]);

  // Show loading state while validation is in progress
  if (isLoading) {
    console.log("ResultsDisplay - Showing loading state");
    return <AssessmentLoading />;
  }

  // Show error if validation failed
  if (errorType) {
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

  // Fallback - should not reach here in normal flow
  return <AssessmentLoading />;
};

export default ResultsDisplay;

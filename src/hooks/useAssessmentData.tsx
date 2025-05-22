
import { useEffect, useState } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { isValidAssessmentResult } from '@/utils/assessmentValidation';

interface UseAssessmentDataReturn {
  displayCategories: Category[];
  displayDemographics: Demographics;
  isAssessmentDataValid: boolean;
  isAssessmentDataLoading: boolean;
}

/**
 * Hook to manage assessment data display
 * Handles both specific assessment data (from ID) or current assessment data
 */
export const useAssessmentData = (
  assessmentId: string | undefined,
  specificAssessmentData: { categories: Category[], demographics: Demographics } | null,
  loadingSpecificData: boolean,
  currentCategories?: Category[],
  currentDemographics?: Demographics
): UseAssessmentDataReturn => {
  const [isAssessmentDataValid, setIsAssessmentDataValid] = useState(false);
  
  // Determine which categories and demographics to display
  // Use specific assessment data if we have an ID, otherwise use the current assessment data
  const displayCategories = assessmentId && specificAssessmentData 
    ? specificAssessmentData.categories 
    : currentCategories || [];
    
  const displayDemographics = assessmentId && specificAssessmentData 
    ? specificAssessmentData.demographics 
    : currentDemographics || {};

  // Validate the data whenever it changes
  useEffect(() => {
    console.log("useAssessmentData - Display categories:", displayCategories);
    console.log("useAssessmentData - Display categories count:", displayCategories?.length || 0);
    
    // More thorough validation
    if (!displayCategories || !Array.isArray(displayCategories) || displayCategories.length === 0) {
      console.log("useAssessmentData - Invalid category data (missing or empty array)");
      setIsAssessmentDataValid(false);
      return;
    }
    
    // Check if all categories have skills
    const missingSkills = displayCategories.some(category => 
      !category.skills || !Array.isArray(category.skills) || category.skills.length === 0
    );
    
    if (missingSkills) {
      console.log("useAssessmentData - Some categories are missing skills");
      setIsAssessmentDataValid(false);
      return;
    }
    
    // Check if we have any valid ratings
    const hasValidRatings = displayCategories.some(category => 
      category.skills.some(skill => 
        skill.ratings && (
          (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
          (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
        )
      )
    );
    
    if (!hasValidRatings) {
      console.log("useAssessmentData - No valid ratings found in categories");
      setIsAssessmentDataValid(false);
      return;
    }
    
    console.log("useAssessmentData - Data validation passed, setting to valid");
    setIsAssessmentDataValid(true);
  }, [displayCategories]);

  return {
    displayCategories,
    displayDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading: loadingSpecificData
  };
};

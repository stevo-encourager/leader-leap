
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
    
    const isValid = isValidAssessmentResult(displayCategories);
    console.log("useAssessmentData - Is assessment data valid:", isValid);
    
    setIsAssessmentDataValid(isValid);
  }, [displayCategories]);

  return {
    displayCategories,
    displayDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading: loadingSpecificData
  };
};

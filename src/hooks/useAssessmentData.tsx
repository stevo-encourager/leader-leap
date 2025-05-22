
import { useEffect, useState } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';

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

  // Additional debugging for data source
  useEffect(() => {
    if (assessmentId && specificAssessmentData) {
      console.log("useAssessmentData - Using specific assessment data for ID:", assessmentId);
    } else {
      console.log("useAssessmentData - Using current assessment data (no specific ID)");
    }
    
    console.log("useAssessmentData - Current categories count:", currentCategories?.length || 0);
    if (assessmentId) {
      console.log("useAssessmentData - Specific data:", specificAssessmentData);
    }
  }, [assessmentId, specificAssessmentData, currentCategories]);

  // Validate the data whenever it changes
  useEffect(() => {
    console.log("useAssessmentData - Display categories:", displayCategories);
    console.log("useAssessmentData - Display categories count:", displayCategories?.length || 0);
    
    // Check if displayCategories contains undefined values
    if (Array.isArray(displayCategories)) {
      const hasUndefined = displayCategories.some(cat => cat === undefined);
      if (hasUndefined) {
        console.warn("useAssessmentData - Categories array contains undefined values");
      }
      
      // Log first category as a sample
      if (displayCategories.length > 0) {
        const firstCategory = displayCategories[0];
        console.log("useAssessmentData - First category sample:", firstCategory);
        
        if (firstCategory && firstCategory.skills && firstCategory.skills.length > 0) {
          const firstSkill = firstCategory.skills[0];
          console.log("useAssessmentData - First skill sample:", firstSkill);
          if (firstSkill && firstSkill.ratings) {
            console.log("useAssessmentData - First skill ratings:", firstSkill.ratings);
          }
        }
      }
    }
    
    // Simpler validation to catch truly empty data
    if (!displayCategories || !Array.isArray(displayCategories) || displayCategories.length === 0) {
      console.log("useAssessmentData - Invalid category data (missing or empty array)");
      setIsAssessmentDataValid(false);
      return;
    }
    
    // Ensure categories have skills (less strict validation)
    const hasSkills = displayCategories.some(category => 
      category && category.skills && Array.isArray(category.skills) && category.skills.length > 0
    );
    
    if (!hasSkills) {
      console.log("useAssessmentData - No categories with skills found");
      setIsAssessmentDataValid(false);
      return;
    }
    
    // Check for any ratings data (less strict)
    const hasAnyRatings = displayCategories.some(category => 
      category && category.skills && category.skills.some(skill => 
        skill && skill.ratings && (
          typeof skill.ratings.current === 'number' || 
          typeof skill.ratings.desired === 'number'
        )
      )
    );
    
    if (!hasAnyRatings) {
      console.log("useAssessmentData - No valid ratings found in categories");
      setIsAssessmentDataValid(false);
      return;
    }

    // Count the number of skills with valid ratings for debugging
    let ratingCount = 0;
    let skillCount = 0;
    let categoriesWithRatings = 0;
    
    displayCategories.forEach(category => {
      if (!category || !category.skills) return;
      
      let categoryHasRatings = false;
      skillCount += category.skills.length;
      
      category.skills.forEach(skill => {
        if (!skill || !skill.ratings) return;
        
        if (typeof skill.ratings.current === 'number' || typeof skill.ratings.desired === 'number') {
          ratingCount++;
          categoryHasRatings = true;
        }
      });
      
      if (categoryHasRatings) {
        categoriesWithRatings++;
      }
    });
    
    console.log(`useAssessmentData - Found ${ratingCount} skills with ratings out of ${skillCount} total skills`);
    console.log(`useAssessmentData - ${categoriesWithRatings} out of ${displayCategories.length} categories have ratings`);
    
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

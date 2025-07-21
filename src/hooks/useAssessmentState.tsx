
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentState = (initialCategories: Category[] = []) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Initialize categories when initialCategories becomes available
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0 && categories.length === 0) {
      // Check if current categories have valid ratings - if so, don't override
      const currentHasValidRatings = categories.some(cat => 
        cat?.skills?.some(skill => 
          skill?.ratings?.current > 0 && skill?.ratings?.desired > 0
        )
      );
      
      // Only set initial categories if current ones don't have valid ratings
      if (!currentHasValidRatings) {
        setCategories(initialCategories);
      }
    }
  }, [initialCategories, categories]);

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    // Local storage removed - assessments now saved to Supabase
  };

  const handleDemographicsUpdate = (updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
    // Local storage removed - assessments now saved to Supabase
  };

  const resetAssessment = (freshCategories?: Category[]) => {
    // Reset state - no local storage clearing needed
    if (freshCategories && freshCategories.length > 0) {
      setCategories(freshCategories);
    } else if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    } else {
      setCategories([]);
    }
    
    setDemographics({});
  };

  return {
    categories,
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    resetAssessment
  };
};

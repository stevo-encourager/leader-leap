
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentState = (initialCategories: Category[] = []) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Initialize categories when initialCategories becomes available
  useEffect(() => {
    console.log('useAssessmentState - initialCategories changed:', { 
      initialLength: initialCategories?.length, 
      currentLength: categories.length,
      hasInitialRatings: initialCategories?.some(cat => 
        cat?.skills?.some(skill => skill?.ratings?.current > 0)
      ),
      hasZeroRatings: initialCategories?.every(cat => 
        cat?.skills?.every(skill => skill?.ratings?.current === 0)
      )
    });
    
    // Only set categories from initialCategories if we don't already have categories
    // or if the initialCategories have zero ratings (fresh assessment)
    const shouldSetCategories = !categories.length || 
      (initialCategories && initialCategories.length > 0 && 
       initialCategories.every(cat => 
         cat?.skills?.every(skill => skill?.ratings?.current === 0)
       ));
    
    if (shouldSetCategories && initialCategories && initialCategories.length > 0) {
      console.log('useAssessmentState - Setting categories from initial');
      setCategories(initialCategories);
    } else if (initialCategories && initialCategories.length > 0) {
      console.log('useAssessmentState - Skipping category update to preserve existing data');
    }
  }, [initialCategories, categories.length]);

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    
    // Save to local storage for persistence
    storeLocalAssessmentData(updatedCategories, demographics);
  };

  const handleDemographicsUpdate = (updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
    
    // Save to local storage for persistence
    storeLocalAssessmentData(categories, updatedDemographics);
  };

  const resetAssessment = (freshCategories?: Category[]) => {
    // Clear local storage first
    clearLocalAssessmentData();
    
    // Reset state
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

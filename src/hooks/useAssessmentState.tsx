
import { useState, useEffect, useCallback } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentState = (initialCategories: Category[] = []) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Initialize categories from props
  useEffect(() => {
    if (initialCategories.length > 0 && categories.length === 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories, categories.length]);

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    
    // Save to local storage for persistence
    storeLocalAssessmentData(updatedCategories, demographics);
  };

            const handleDemographicsUpdate = useCallback((updatedDemographics: Demographics) => {
            console.log('useAssessmentState - handleDemographicsUpdate called with:', updatedDemographics);
            console.log('useAssessmentState - Previous demographics state:', demographics);
            setDemographics(updatedDemographics);
            console.log('useAssessmentState - Demographics state updated');
            
            // Save to local storage for persistence (consistent with categories behavior)
            console.log('useAssessmentState - Storing to localStorage with categories length:', categories?.length);
            storeLocalAssessmentData(categories, updatedDemographics);
          }, [categories, demographics]);

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

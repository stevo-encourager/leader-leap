
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentState = (initialCategories: Category[] = []) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Initialize categories when initialCategories becomes available
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0 && categories.length === 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

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

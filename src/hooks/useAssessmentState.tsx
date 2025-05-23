
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentState = (initialCategories: Category[] = []) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Initialize categories when initialCategories becomes available
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0 && categories.length === 0) {
      console.log("useAssessmentState - Initializing with categories:", initialCategories.length);
      setCategories(initialCategories);
    }
  }, [initialCategories, categories.length]);

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    console.log("useAssessmentState - Categories updated, new length:", updatedCategories.length);
    setCategories(updatedCategories);
    
    // Save to local storage for persistence
    storeLocalAssessmentData(updatedCategories, demographics);
  };

  const handleDemographicsUpdate = (updatedDemographics: Demographics) => {
    console.log("useAssessmentState - Demographics updated:", updatedDemographics);
    setDemographics(updatedDemographics);
    
    // Save to local storage for persistence
    storeLocalAssessmentData(categories, updatedDemographics);
  };

  const resetAssessment = (freshCategories?: Category[]) => {
    console.log("resetAssessment - Resetting all categories to defaults with zero ratings");
    
    // Clear local storage first
    clearLocalAssessmentData();
    console.log("resetAssessment - Cleared local storage assessment data for new assessment");
    
    // Reset state
    if (freshCategories && freshCategories.length > 0) {
      console.log("resetAssessment - Using provided fresh categories:", freshCategories.length);
      setCategories(freshCategories);
    } else if (initialCategories && initialCategories.length > 0) {
      console.log("resetAssessment - Using initial categories:", initialCategories.length);
      setCategories(initialCategories);
    } else {
      console.log("resetAssessment - No categories available, setting empty array");
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

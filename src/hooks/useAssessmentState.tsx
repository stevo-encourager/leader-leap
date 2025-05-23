
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { storeLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentState = (initialCategories: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Log when categories are updated for debugging
  useEffect(() => {
    console.log("useAssessmentState - Categories updated, new length:", categories?.length || 0);
    if (categories && categories.length > 0) {
      // Count skills with ratings
      let skillsWithRatings = 0;
      categories.forEach(category => {
        if (category && category.skills) {
          category.skills.forEach(skill => {
            if (skill && skill.ratings && 
               (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) ||
               (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)) {
              skillsWithRatings++;
            }
          });
        }
      });
      console.log(`useAssessmentState - Categories contain ${skillsWithRatings} skills with ratings`);
    }
  }, [categories]);

  const handleCategoriesUpdate = (newCategories: Category[]) => {
    console.log("handleCategoriesUpdate - Received new categories:", 
                newCategories ? JSON.stringify({ length: newCategories.length, isArray: Array.isArray(newCategories) }) : "none");
    
    if (newCategories && Array.isArray(newCategories) && newCategories.length > 0) {
      // Count skills with ratings in new data
      let skillsWithRatings = 0;
      newCategories.forEach(category => {
        if (category && category.skills) {
          category.skills.forEach(skill => {
            if (skill && skill.ratings && 
               (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) ||
               (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)) {
              skillsWithRatings++;
            }
          });
        }
      });
      console.log(`handleCategoriesUpdate - New categories have ${skillsWithRatings} skills with ratings`);
      
      setCategories(newCategories);
    } else {
      console.error("handleCategoriesUpdate: Invalid categories data:", newCategories);
    }
  };

  const handleDemographicsUpdate = (newDemographics: Demographics) => {
    console.log("handleDemographicsUpdate - Received new demographics:", newDemographics);
    setDemographics(newDemographics);
  };

  // Reset all categories to default values
  const resetAssessment = (freshCategories: Category[]) => {
    console.log("resetAssessment - Resetting all categories to defaults with zero ratings");
    
    // Set fresh categories and reset demographics
    setCategories(freshCategories);
    setDemographics({});
    
    // Clear any existing local storage data to prevent it from interfering
    localStorage.removeItem('assessmentData');
    console.log("resetAssessment - Cleared local storage assessment data for new assessment");
  };

  return {
    categories,
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    resetAssessment
  };
};


import { useState, useCallback, useEffect } from 'react';
import { Category, Demographics, initialCategories } from '@/utils/assessmentData';

export const useAssessmentData = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Ensure initialCategories has correct format on first load
  useEffect(() => {
    if (categories === initialCategories) {
      // Apply normalization to initial categories to ensure proper structure
      const normalizedCategories = initialCategories.map(category => ({
        ...category,
        skills: category.skills.map(skill => ({
          ...skill,
          ratings: {
            current: Number(skill.ratings.current || 0),
            desired: Number(skill.ratings.desired || 0)
          }
        }))
      }));
      
      setCategories(normalizedCategories);
    }
  }, []);

  const handleCategoriesUpdate = useCallback((updatedCategories: Category[]) => {
    console.log("useAssessmentData - Updating categories:", updatedCategories);
    
    // Ensure we have valid categories
    if (!updatedCategories || !Array.isArray(updatedCategories) || updatedCategories.length === 0) {
      console.error("Invalid categories data passed to handleCategoriesUpdate");
      return;
    }
    
    try {
      // Ensure all ratings are numbers
      const normalizedCategories = updatedCategories.map(category => ({
        ...category,
        skills: (category.skills || []).map(skill => ({
          ...skill,
          ratings: {
            current: Number(skill.ratings?.current || 0),
            desired: Number(skill.ratings?.desired || 0)
          }
        }))
      }));
      
      console.log("useAssessmentData - Normalized categories:", normalizedCategories);
      setCategories(normalizedCategories);
      
    } catch (error) {
      console.error("Error in handleCategoriesUpdate:", error);
      // Maintain existing state on error
    }
  }, []);

  const handleDemographicsUpdate = useCallback((updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
  }, []);

  return {
    categories,
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate
  };
};

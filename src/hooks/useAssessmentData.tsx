
import { useState, useCallback, useEffect } from 'react';
import { Category, Demographics, initialCategories } from '@/utils/assessmentData';

export const useAssessmentData = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Log categories whenever they change
  useEffect(() => {
    console.log("useAssessmentData hook - current categories:", categories);
    
    // Verify that ratings are properly initialized 
    if (categories && categories.length > 0 && categories[0].skills.length > 0) {
      const firstSkill = categories[0].skills[0];
      console.log("First skill ratings:", firstSkill.ratings);
    }
  }, [categories]);

  const handleCategoriesUpdate = useCallback((updatedCategories: Category[]) => {
    console.log("Updating categories:", updatedCategories);
    
    // Ensure all ratings are properly initialized and are numbers
    const normalizedCategories = updatedCategories.map(category => ({
      ...category,
      skills: category.skills.map(skill => ({
        ...skill,
        ratings: {
          current: typeof skill.ratings.current === 'number' ? skill.ratings.current : 0,
          desired: typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0
        }
      }))
    }));
    
    console.log("Normalized categories with number ratings:", normalizedCategories);
    setCategories(normalizedCategories);
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

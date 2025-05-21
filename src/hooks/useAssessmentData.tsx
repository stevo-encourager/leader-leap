
import { useState, useCallback, useEffect } from 'react';
import { Category, Demographics, initialCategories } from '@/utils/assessmentData';

export const useAssessmentData = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});

  const handleCategoriesUpdate = useCallback((updatedCategories: Category[]) => {
    // Ensure all ratings are numbers
    const normalizedCategories = updatedCategories.map(category => ({
      ...category,
      skills: category.skills.map(skill => ({
        ...skill,
        ratings: {
          current: Number(skill.ratings.current),
          desired: Number(skill.ratings.desired)
        }
      }))
    }));
    
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

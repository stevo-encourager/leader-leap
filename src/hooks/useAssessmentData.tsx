
import { useState, useCallback, useEffect } from 'react';
import { Category, Demographics, initialCategories } from '@/utils/assessmentData';

export const useAssessmentData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});

  // Initialize with properly formatted categories
  useEffect(() => {
    console.log("useAssessmentData - Initializing with categories");
    // Make a deep clone with proper type conversion
    const formattedCategories = JSON.parse(JSON.stringify(initialCategories)).map(
      (category: Category) => ({
        ...category,
        skills: category.skills.map(skill => ({
          ...skill,
          ratings: {
            current: Number(skill.ratings.current || 0),
            desired: Number(skill.ratings.desired || 0)
          }
        }))
      })
    );
    
    console.log("useAssessmentData - Formatted initial categories:", formattedCategories);
    setCategories(formattedCategories);
  }, []);

  const handleCategoriesUpdate = useCallback((updatedCategories: Category[]) => {
    console.log("useAssessmentData - Updating categories:", updatedCategories);
    
    if (!updatedCategories || !Array.isArray(updatedCategories)) {
      console.error("Invalid categories data passed to handleCategoriesUpdate");
      return;
    }
    
    // Ensure all ratings are numbers and handle edge cases
    const formattedCategories = updatedCategories.map(category => ({
      ...category,
      skills: (category.skills || []).map(skill => ({
        ...skill,
        ratings: {
          current: typeof skill.ratings?.current === 'number' 
            ? skill.ratings.current 
            : Number(skill.ratings?.current || 0),
          desired: typeof skill.ratings?.desired === 'number' 
            ? skill.ratings.desired 
            : Number(skill.ratings?.desired || 0)
        }
      }))
    }));
    
    console.log("useAssessmentData - Formatted categories:", formattedCategories);
    setCategories(formattedCategories);
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

import { useState, useEffect } from 'react';
import { Category } from '@/utils/assessmentTypes';
import { allCategories } from '@/utils/assessmentCategories';
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { toast } from './use-toast';

export const useAssessmentInitialization = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to create fresh categories with all ratings reset to 0
  const createFreshCategories = () => {
    return JSON.parse(JSON.stringify(allCategories)).map((category: Category) => ({
      ...category,
      skills: category.skills.map(skill => ({
        ...skill,
        ratings: {
          current: 0,
          desired: 0
        }
      }))
    }));
  };

  // Initialize categories with fresh data - always start with zero ratings
  useEffect(() => {
    if (!isInitialized) {
      try {
        console.log('useAssessmentInitialization - Creating fresh categories');
        const freshCategories = createFreshCategories();
        if (freshCategories && freshCategories.length > 0) {
          setCategories(freshCategories);
        } else {
          console.error("useAssessmentInitialization - Fresh categories are empty or invalid");
          toast({
            title: "Error loading categories",
            description: "Could not load assessment categories. Please refresh the page.",
            variant: "destructive",
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("useAssessmentInitialization - Error initializing categories:", error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // Function to load existing data when explicitly requested (e.g., continuing assessment)
  const loadExistingData = () => {
    try {
      const existingData = getLocalAssessmentData();
      
      if (existingData && existingData.categories && existingData.categories.length > 0) {
        // Check if the existing data has valid ratings
        const hasValidRatings = existingData.categories.some(cat => 
          cat && cat.skills && cat.skills.some(skill => 
            skill && skill.ratings && 
            skill.ratings.current > 0 && 
            skill.ratings.desired > 0
          )
        );
        
        if (hasValidRatings) {
          setCategories(existingData.categories);
          return true; // Successfully loaded existing data
        }
      }
      return false; // No valid existing data found
    } catch (error) {
      console.error("useAssessmentInitialization - Error loading existing data:", error);
      return false;
    }
  };

  return {
    categories,
    setCategories,
    createFreshCategories,
    loadExistingData,
    isInitialized
  };
};

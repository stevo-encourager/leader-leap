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

  // Initialize categories with default data
  useEffect(() => {
    if (!isInitialized && (!categories || categories.length === 0)) {
      console.log("useAssessmentInitialization - Initializing with default categories");
      try {
        // First check if we have locally stored assessment data
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log("useAssessmentInitialization - Found local assessment data, using that");
          setCategories(localData.categories);
          setIsInitialized(true);
          return;
        }
        
        // Otherwise use fresh categories with reset ratings
        const freshCategories = createFreshCategories();
        if (freshCategories && freshCategories.length > 0) {
          console.log(`useAssessmentInitialization - Loaded ${freshCategories.length} fresh categories with reset ratings`);
          setCategories(freshCategories);
          setIsInitialized(true);
        } else {
          console.error("useAssessmentInitialization - Fresh categories are empty or invalid");
          toast({
            title: "Error loading categories",
            description: "Could not load assessment categories. Please refresh the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("useAssessmentInitialization - Error initializing categories:", error);
      }
    }
  }, [categories, isInitialized]);

  return {
    categories,
    setCategories,
    createFreshCategories,
    isInitialized
  };
};

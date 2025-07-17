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

  // Initialize categories with default data - only run once
  useEffect(() => {
    if (!isInitialized) {
      console.log("useAssessmentInitialization - Initializing categories");
      try {
        // Check if there's existing local assessment data to preserve
        const existingData = getLocalAssessmentData();
        
        if (existingData && existingData.categories && existingData.categories.length > 0) {
          console.log("useAssessmentInitialization - Found existing local assessment data, preserving it");
          console.log("useAssessmentInitialization - Existing categories count:", existingData.categories.length);
          
          // Check if the existing data has valid ratings
          const hasValidRatings = existingData.categories.some(cat => 
            cat && cat.skills && cat.skills.some(skill => 
              skill && skill.ratings && 
              skill.ratings.current > 0 && 
              skill.ratings.desired > 0
            )
          );
          
          if (hasValidRatings) {
            console.log("useAssessmentInitialization - Using existing data with valid ratings");
            setCategories(existingData.categories);
          } else {
            console.log("useAssessmentInitialization - Existing data has no valid ratings, using fresh categories");
            const freshCategories = createFreshCategories();
            setCategories(freshCategories);
          }
        } else {
          console.log("useAssessmentInitialization - No existing data found, using fresh categories");
          // Always use fresh categories with reset ratings for new assessments
          const freshCategories = createFreshCategories();
          if (freshCategories && freshCategories.length > 0) {
            console.log(`useAssessmentInitialization - Loaded ${freshCategories.length} fresh categories`);
            setCategories(freshCategories);
          } else {
            console.error("useAssessmentInitialization - Fresh categories are empty or invalid");
            toast({
              title: "Error loading categories",
              description: "Could not load assessment categories. Please refresh the page.",
              variant: "destructive",
            });
          }
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("useAssessmentInitialization - Error initializing categories:", error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  return {
    categories,
    setCategories,
    createFreshCategories,
    isInitialized
  };
};

import { useState, useEffect } from 'react';
import { Category } from '@/utils/assessmentTypes';
import { allCategories } from '@/utils/assessmentCategories';
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { toast } from './use-toast';

export const useAssessmentInitialization = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFreshAssessment, setIsFreshAssessment] = useState(false);

  // Function to create fresh categories with all ratings reset to 0
  const createFreshCategories = () => {
    console.log('createFreshCategories - Creating completely fresh categories with zero ratings');
    return allCategories.map((category: Category) => ({
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

  // Initialize categories with default data - only run once and preserve valid data
  useEffect(() => {
    // Skip all initialization if we've already done a fresh assessment
    if (isFreshAssessment) {
      console.log('useAssessmentInitialization - Skipping initialization, fresh assessment already set');
      return;
    }
    
    if (!isInitialized) {
      try {
        // If this is a fresh assessment, skip restoration and use fresh categories
        if (isFreshAssessment) {
          console.log('useAssessmentInitialization - Fresh assessment requested, using zero ratings');
          const freshCategories = createFreshCategories();
          if (freshCategories && freshCategories.length > 0) {
            setCategories(freshCategories);
          }
        } else {
          // FIRST, check if we have valid local storage data to preserve
          const existingData = getLocalAssessmentData();
          let shouldUseExistingData = false;
          
          if (existingData && existingData.categories && existingData.categories.length > 0) {
            // Check if the existing data has valid ratings
            const hasValidRatings = existingData.categories.some(cat => 
              cat && cat.skills && cat.skills.some(skill => 
                skill && skill.ratings && 
                skill.ratings.current > 0 && 
                skill.ratings.desired > 0
              )
            );
            
            console.log('useAssessmentInitialization - Found local data with valid ratings:', hasValidRatings);
            
            if (hasValidRatings) {
              console.log('useAssessmentInitialization - Using existing data with valid ratings');
              setCategories(existingData.categories);
              shouldUseExistingData = true;
            }
          }
          
          // Only create fresh categories if we don't have valid existing data
          if (!shouldUseExistingData) {
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
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("useAssessmentInitialization - Error initializing categories:", error);
        setIsInitialized(true);
      }
    } else if (!isFreshAssessment) {
      // Only restore existing data if we haven't explicitly started a fresh assessment
      // If already initialized, check if we need to preserve existing valid data
      const currentHasValidRatings = categories.some(cat => 
        cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && 
          skill.ratings.current > 0 && 
          skill.ratings.desired > 0
        )
      );
      
      if (!currentHasValidRatings) {
        // Current categories have no valid ratings, check if local storage has better data
        const existingData = getLocalAssessmentData();
        if (existingData && existingData.categories && existingData.categories.length > 0) {
          const hasValidRatings = existingData.categories.some(cat => 
            cat && cat.skills && cat.skills.some(skill => 
              skill && skill.ratings && 
              skill.ratings.current > 0 && 
              skill.ratings.desired > 0
            )
          );
          
          if (hasValidRatings) {
            console.log('useAssessmentInitialization - Restoring valid data from localStorage after reinitialization');
            setCategories(existingData.categories);
          }
        }
      }
    }
  }, [isInitialized, isFreshAssessment]);

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

  // Function to explicitly start a fresh assessment (ignoring any existing data)
  const startFreshAssessment = () => {
    console.log('useAssessmentInitialization - Starting fresh assessment with zero ratings');
    
    // Clear localStorage first to prevent any restoration
    localStorage.removeItem('assessmentData');
    
    // Set the flag to prevent useEffect from overriding
    setIsFreshAssessment(true);
    
    // IMMEDIATELY create and set fresh categories - don't wait for useEffect
    const freshCategories = createFreshCategories();
    if (freshCategories && freshCategories.length > 0) {
      console.log('useAssessmentInitialization - DIRECTLY setting fresh categories');
      setCategories(freshCategories);
      setIsInitialized(true); // Mark as initialized to prevent useEffect override
      return true;
    }
    return false;
  };

  return {
    categories,
    setCategories,
    createFreshCategories,
    loadExistingData,
    startFreshAssessment,
    isInitialized
  };
};

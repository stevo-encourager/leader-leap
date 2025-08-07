import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/utils/assessmentTypes';
import { allCategories } from '@/utils/assessmentCategories';
import { getLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { toast } from './use-toast';

export const useAssessmentInitialization = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFreshAssessment, setIsFreshAssessment] = useState(false);

  // Function to create fresh categories with all ratings reset to 0
  const createFreshCategories = useCallback(() => {
    const freshCategories = allCategories.map(category => ({
      ...category,
      skills: category.skills.map(skill => ({
        ...skill,
        ratings: { current: 0, desired: 0 }
      }))
    }));
    return freshCategories;
  }, []);

  // Initialize categories with default data - only run once and preserve valid data
  useEffect(() => {
    if (!isInitialized) {
      try {
        // Check if we're starting a new assessment by looking at the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isNewAssessment = window.location.pathname === '/assessment' && 
          urlParams.get('new') === 'true';
        
        // If this is a fresh assessment, skip restoration and use fresh categories
        if (isFreshAssessment) {
          const freshCategories = createFreshCategories();
          if (freshCategories && freshCategories.length > 0) {
            setCategories(freshCategories);
          }
        } else if (isNewAssessment) {
          // For new assessments, always start with fresh categories
          // Clear localStorage to ensure no previous data is restored
          clearLocalAssessmentData();
          const freshCategories = createFreshCategories();
          if (freshCategories && freshCategories.length > 0) {
            setCategories(freshCategories);
            setIsInitialized(true); // Mark as initialized immediately
          } else {
            console.error("useAssessmentInitialization - Fresh categories are empty or invalid");
            toast({
              title: "Error loading categories",
              description: "Could not load assessment categories. Please refresh the page.",
              variant: "destructive",
            });
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
            
            if (hasValidRatings) {
              setCategories(existingData.categories);
              shouldUseExistingData = true;
            }
          }
          
          // Only create fresh categories if we don't have valid existing data
          if (!shouldUseExistingData) {
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
            setCategories(existingData.categories);
          }
        }
      }
    }
  }, [isInitialized, isFreshAssessment, createFreshCategories]);

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
  const startFreshAssessment = (preserveDemographics = false) => {
    // Clear localStorage first to prevent any restoration
    localStorage.removeItem('assessmentData');
    
    // Set the flag to prevent useEffect from overriding
    setIsFreshAssessment(true);
    
    // IMMEDIATELY create and set fresh categories - don't wait for useEffect
    const freshCategories = createFreshCategories();
    if (freshCategories && freshCategories.length > 0) {
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

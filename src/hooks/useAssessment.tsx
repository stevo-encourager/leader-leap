import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useResultsManagement } from './useResultsManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { allCategories } from '@/utils/assessmentCategories';
import { toast } from './use-toast';
import { storeLocalAssessmentData, getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessment = () => {
  const {
    currentStep,
    setCurrentStep,
    handleStartAssessment,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment
  } = useNavigationState();

  // Add local state for assessment data
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});
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
      console.log("useAssessment - Initializing with default categories");
      try {
        // First check if we have locally stored assessment data
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log("useAssessment - Found local assessment data, using that");
          setCategories(localData.categories);
          if (localData.demographics) {
            setDemographics(localData.demographics);
          }
          setIsInitialized(true);
          return;
        }
        
        // Otherwise use fresh categories with reset ratings
        const freshCategories = createFreshCategories();
        if (freshCategories && freshCategories.length > 0) {
          console.log(`useAssessment - Loaded ${freshCategories.length} fresh categories with reset ratings`);
          setCategories(freshCategories);
          setIsInitialized(true);
        } else {
          console.error("useAssessment - Fresh categories are empty or invalid");
          toast({
            title: "Error loading categories",
            description: "Could not load assessment categories. Please refresh the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("useAssessment - Error initializing categories:", error);
      }
    }
  }, [categories, isInitialized]);

  // Log when categories are updated for debugging
  useEffect(() => {
    console.log("useAssessment - Categories updated, new length:", categories?.length || 0);
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
      console.log(`useAssessment - Categories contain ${skillsWithRatings} skills with ratings`);
    }
  }, [categories]);

  // Reset all categories to default values when starting a new assessment
  const handleStartNewAssessment = () => {
    console.log("Starting new assessment - resetting all categories to defaults with zero ratings");
    
    // Create completely fresh copy of default categories with all ratings reset to 0
    const freshCategories = createFreshCategories();
    
    // Set fresh categories and reset demographics
    setCategories(freshCategories);
    setDemographics({});
    
    // Clear any existing local storage data to prevent it from interfering
    localStorage.removeItem('assessmentData');
    console.log("Cleared local storage assessment data for new assessment");
    
    // Call the original handler
    handleStartAssessment();
  };

  // Handle categories and demographics updates
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

  // Handle completing the assessment
  const wrappedHandleCompleteAssessment = () => {
    console.log("wrappedHandleCompleteAssessment - Completing assessment with categories:", 
                categories ? JSON.stringify({ length: categories.length, isArray: Array.isArray(categories) }) : "none");
    
    // Check if we have valid category data before completing
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error("wrappedHandleCompleteAssessment - Cannot complete: categories is empty or invalid");
      toast({
        title: "Error completing assessment",
        description: "Assessment data is missing or invalid. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    if (skillsWithRatings === 0) {
      console.warn("wrappedHandleCompleteAssessment - No skills with ratings found");
    }
    
    // CRITICAL FIX: Store assessment data locally before changing page
    storeLocalAssessmentData(categories, demographics);
    console.log("wrappedHandleCompleteAssessment - Stored assessment data locally");
    
    // Call the original handler
    handleCompleteAssessment();
  };

  const {
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm,
    currentAssessmentId
  } = useResultsManagement(
    categories, 
    demographics, 
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    setCurrentStep
  );

  const { user } = useAuth();

  // Effect to handle result saving when user logs in
  useEffect(() => {
    if (user && currentStep === 'results' && categories && categories.length > 0) {
      console.log("useAssessment - User logged in and on results page, triggering save");
      handleSaveResults();
    }
  }, [user, currentStep, handleSaveResults, categories]);

  return {
    // Navigation state
    currentStep,
    
    // Assessment data
    categories,
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    
    // Navigation functions
    handleStartAssessment: handleStartNewAssessment, // Use our custom handler that resets data
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment: wrappedHandleCompleteAssessment,
    
    // Results management
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm,
    currentAssessmentId
  };
};

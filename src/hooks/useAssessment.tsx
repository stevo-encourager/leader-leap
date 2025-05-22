
import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useResultsManagement } from './useResultsManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { allCategories } from '@/utils/assessmentCategories';
import { toast } from './use-toast';

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

  // Initialize categories with default data
  useEffect(() => {
    if (!isInitialized && (!categories || categories.length === 0)) {
      console.log("useAssessment - Initializing with default categories");
      try {
        // Deep clone the allCategories to avoid reference issues
        const defaultCategories = JSON.parse(JSON.stringify(allCategories));
        if (defaultCategories && defaultCategories.length > 0) {
          console.log(`useAssessment - Loaded ${defaultCategories.length} default categories`);
          setCategories(defaultCategories);
          setIsInitialized(true);
        } else {
          console.error("useAssessment - Default categories are empty or invalid");
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

  // Handle categories and demographics updates
  const handleCategoriesUpdate = (newCategories: Category[]) => {
    if (newCategories && Array.isArray(newCategories)) {
      setCategories(newCategories);
    } else {
      console.error("handleCategoriesUpdate: Invalid categories data:", newCategories);
    }
  };

  const handleDemographicsUpdate = (newDemographics: Demographics) => {
    setDemographics(newDemographics);
  };

  const {
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm
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
    if (user && currentStep === 'results') {
      handleSaveResults();
    }
  }, [user, currentStep, handleSaveResults]);

  return {
    // Navigation state
    currentStep,
    
    // Assessment data
    categories,
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    
    // Navigation functions
    handleStartAssessment,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment,
    
    // Results management
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm
  };
};

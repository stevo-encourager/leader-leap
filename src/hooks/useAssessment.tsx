
import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { useAuth } from '@/contexts/AuthContext';
import { useResultsManagement } from './useResultsManagement';
import { useAssessmentInitialization } from './useAssessmentInitialization';
import { useAssessmentState } from './useAssessmentState';
import { useAssessmentCompletion } from './useAssessmentCompletion';
import { clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessment = () => {
  const {
    currentStep,
    setCurrentStep,
    handleStartAssessment,
    handleContinueToAssessment,
    handleContinueToInstructions,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment
  } = useNavigationState();

  // Initialize categories first
  const { categories: initializedCategories, createFreshCategories, loadExistingData, isInitialized } = useAssessmentInitialization();

  // Use our hooks for managing assessment state - pass the initialized categories
  const { 
    categories, 
    demographics, 
    handleCategoriesUpdate, 
    handleDemographicsUpdate, 
    resetAssessment 
  } = useAssessmentState(initializedCategories);

  const { handleCompleteAssessment: wrappedHandleCompleteAssessment } = 
    useAssessmentCompletion(categories, demographics, handleCompleteAssessment);

  // Reset all categories to default values when starting a new assessment
  const handleStartNewAssessment = () => {
    console.log("handleStartNewAssessment - Starting completely fresh assessment");
    // Clear local storage FIRST to ensure we don't preserve any old data
    clearLocalAssessmentData();
    console.log("handleStartNewAssessment - Cleared local storage for fresh start");
    
    // Create completely fresh copy of default categories with all ratings reset to 0
    const freshCategories = createFreshCategories();
    console.log("handleStartNewAssessment - Created fresh categories:", freshCategories.length);
    
    // Reset assessment state with fresh categories
    resetAssessment(freshCategories);
    
    // Call the original handler to navigate
    handleStartAssessment();
  };

  // Function to continue an existing assessment (loads from local storage)
  const handleContinueAssessment = () => {
    console.log("handleContinueAssessment - Attempting to load existing data");
    const loadedExisting = loadExistingData();
    if (loadedExisting) {
      console.log("handleContinueAssessment - Successfully loaded existing data");
      handleStartAssessment();
    } else {
      console.log("handleContinueAssessment - No existing data found, starting fresh");
      handleStartNewAssessment();
    }
  };

  const {
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm,
    currentAssessmentId
  } = useResultsManagement({
    categories,
    demographics,
    onCategoriesUpdate: handleCategoriesUpdate,
    onDemographicsUpdate: handleDemographicsUpdate
  });

  const { user } = useAuth();

  // Effect to handle result saving when user logs in
  useEffect(() => {
    if (user && currentStep === 'results' && categories && categories.length > 0) {
      handleSaveResults();
    }
  }, [user, currentStep, handleSaveResults, categories]);

  return {
    // Navigation state
    currentStep,
    
    // Assessment data - use the categories from useAssessmentState, but ensure they're initialized
    categories: isInitialized ? categories : [],
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    
    // Navigation functions
    handleStartAssessment: handleStartNewAssessment,
    handleContinueAssessment,
    handleContinueToAssessment,
    handleContinueToInstructions,
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


import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { useAuth } from '@/contexts/AuthContext';
import { useResultsManagement } from './useResultsManagement';
import { useAssessmentInitialization } from './useAssessmentInitialization';
import { useAssessmentState } from './useAssessmentState';
import { useAssessmentCompletion } from './useAssessmentCompletion';

export const useAssessment = () => {
  const {
    currentStep,
    setCurrentStep,
    handleStartAssessment,
    handleContinueToInstructions,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleBackToInstructions,
    handleCompleteAssessment
  } = useNavigationState();

  // Initialize categories first
  const { categories: initializedCategories, createFreshCategories, isInitialized } = useAssessmentInitialization();

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
    console.log("useAssessment - Starting new assessment with fresh categories");
    // Create completely fresh copy of default categories with all ratings reset to 0
    const freshCategories = createFreshCategories();
    console.log("useAssessment - Fresh categories created:", freshCategories?.length || 0);
    resetAssessment(freshCategories);
    
    // Call the original handler
    handleStartAssessment();
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
    
    // Assessment data - use the categories from useAssessmentState, but ensure they're initialized
    categories: isInitialized ? categories : [],
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    
    // Navigation functions
    handleStartAssessment: handleStartNewAssessment,
    handleContinueToInstructions,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleBackToInstructions,
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

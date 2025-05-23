
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
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment
  } = useNavigationState();

  // Use our new hooks for better separation of concerns
  const { categories: initialCategories, createFreshCategories } = useAssessmentInitialization();
  const { 
    categories, 
    demographics, 
    handleCategoriesUpdate, 
    handleDemographicsUpdate, 
    resetAssessment 
  } = useAssessmentState(initialCategories);
  const { handleCompleteAssessment: wrappedHandleCompleteAssessment } = 
    useAssessmentCompletion(categories, demographics, handleCompleteAssessment);

  // Reset all categories to default values when starting a new assessment
  const handleStartNewAssessment = () => {
    // Create completely fresh copy of default categories with all ratings reset to 0
    const freshCategories = createFreshCategories();
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

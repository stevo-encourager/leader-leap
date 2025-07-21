
import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { useAuth } from '@/contexts/AuthContext';
import { useResultsManagement } from './useResultsManagement';
import { useAssessmentInitialization } from './useAssessmentInitialization';
import { useAssessmentState } from './useAssessmentState';
import { useAssessmentCompletion } from './useAssessmentCompletion';
import { clearLocalAssessmentData, getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

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

  // Reset all categories to default values when starting a new assessment
  const handleStartNewAssessment = () => {
    // Only clear local storage if there's no valid assessment data
    const existingData = getLocalAssessmentData();
    const hasValidRatings = existingData?.categories?.some(cat => 
      cat?.skills?.some(skill => 
        skill?.ratings?.current > 0 && skill?.ratings?.desired > 0
      )
    );
    
    if (!hasValidRatings) {
      // Clear local storage FIRST to ensure we don't preserve any old data
      clearLocalAssessmentData();
    }
    
    // Create completely fresh copy of default categories with all ratings reset to 0
    const freshCategories = createFreshCategories();
    
    // Reset assessment state with fresh categories only if no valid data exists
    if (!hasValidRatings) {
      resetAssessment(freshCategories);
    }
    
    // Call the original handler to navigate
    handleStartAssessment();
  };

  // Function to continue an existing assessment (loads from local storage)
  const handleContinueAssessment = () => {
    const loadedExisting = loadExistingData();
    if (loadedExisting) {
      handleStartAssessment();
    } else {
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

  // Create the wrapped completion handler after we have handleShowSignupForm
  const { handleCompleteAssessment: wrappedHandleCompleteAssessment } = 
    useAssessmentCompletion(categories, demographics, handleCompleteAssessment, handleShowSignupForm);

  // Effect to handle result saving when user logs in
  useEffect(() => {
    if (user && currentStep === 'results' && categories && categories.length > 0) {
      // Only save if we have valid ratings
      const hasValidRatings = categories.some(cat => 
        cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && 
          Number(skill.ratings.current) > 0 && 
          Number(skill.ratings.desired) > 0
        )
      );
      
      if (hasValidRatings) {
        console.log('useAssessment - Saving results with valid ratings');
        handleSaveResults();
      } else {
        console.log('useAssessment - Skipping save, no valid ratings found');
      }
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

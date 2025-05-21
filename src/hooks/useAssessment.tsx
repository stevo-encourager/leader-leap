
import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { useAssessmentData } from './useAssessmentData';
import { useResultsManagement } from './useResultsManagement';
import { useAuth } from '@/contexts/AuthContext';

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

  const {
    categories,
    demographics,
    handleCategoriesUpdate,
    handleDemographicsUpdate
  } = useAssessmentData();

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
  }, [user, currentStep]);

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

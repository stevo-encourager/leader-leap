
import { useEffect } from 'react';
import { useNavigationState } from './useNavigationState';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useResultsManagement } from './useResultsManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

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

  // Handle categories and demographics updates
  const handleCategoriesUpdate = (newCategories: Category[]) => {
    setCategories(newCategories);
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

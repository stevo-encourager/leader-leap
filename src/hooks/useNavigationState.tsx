
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AssessmentStep } from '@/utils/assessmentTypes';

export const useNavigationState = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const navigate = useNavigate();
  const location = useLocation();

  // Update the current step based on the route when component mounts
  useEffect(() => {
    if (location.pathname === '/') {
      setCurrentStep('intro');
    } else if (location.pathname === '/assessment') {
      setCurrentStep(prevStep => prevStep === 'intro' ? 'demographics' : prevStep);
    } else if (location.pathname === '/results') {
      setCurrentStep('results');
    }
  }, [location.pathname]);

  // Navigation functions
  const handleStartAssessment = useCallback(() => {
    setCurrentStep('demographics');
    navigate('/assessment');
  }, [navigate]);

  const handleContinueToAssessment = useCallback(() => {
    setCurrentStep('assessment');
  }, []);

  const handleBackToIntro = useCallback(() => {
    setCurrentStep('intro');
    navigate('/');
  }, [navigate]);

  const handleBackToDemographics = useCallback(() => {
    setCurrentStep('demographics');
  }, []);

  const handleCompleteAssessment = useCallback(() => {
    setCurrentStep('results');
    navigate('/results');
  }, [navigate]);

  return {
    currentStep,
    setCurrentStep,
    handleStartAssessment,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment
  };
};

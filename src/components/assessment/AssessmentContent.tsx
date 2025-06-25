import React from 'react';
import { useNavigate } from 'react-router-dom';
import IntroductionPage from '../IntroductionPage';
import DemographicsForm from '../DemographicsForm';
import AssessmentForm from '../AssessmentForm';
import ResultsDisplay from './ResultsDisplay';
import AssessmentInstructions from '../AssessmentInstructions';
import { AssessmentStep, Category, Demographics } from '../../utils/assessmentData';

interface AssessmentContentProps {
  currentStep: AssessmentStep;
  categories: Category[];
  demographics: Demographics;
  onStartAssessment: () => void;
  onDemographicsUpdate: (demographics: Demographics) => void;
  onContinueToAssessment: () => void;
  onContinueToInstructions: () => void;
  onBackToIntro: () => void;
  onBackToDemographics: () => void;
  onCategoriesUpdate: (categories: Category[]) => void;
  onCompleteAssessment: () => void;
  onShowSignupForm?: () => void;
  isAuthenticated: boolean;
}

const AssessmentContent: React.FC<AssessmentContentProps> = ({
  currentStep,
  categories,
  demographics,
  onStartAssessment,
  onDemographicsUpdate,
  onContinueToAssessment,
  onContinueToInstructions,
  onBackToIntro,
  onBackToDemographics,
  onCategoriesUpdate,
  onCompleteAssessment,
  onShowSignupForm,
  isAuthenticated
}) => {
  const navigate = useNavigate();
  
  if (currentStep === 'intro') {
    return (
      <IntroductionPage 
        categories={categories}
        onStartAssessment={() => {
          onStartAssessment();
          navigate('/assessment');
        }}
      />
    );
  }

  if (currentStep === 'demographics') {
    return (
      <DemographicsForm 
        demographics={demographics}
        onDemographicsUpdate={onDemographicsUpdate}
        onContinue={onContinueToInstructions}
        onBack={onBackToIntro}
      />
    );
  }

  if (currentStep === 'instructions') {
    return (
      <AssessmentInstructions onContinue={onContinueToAssessment} onBack={onBackToDemographics} />
    );
  }

  if (currentStep === 'assessment') {
    return (
      <AssessmentForm 
        categories={categories}
        onCategoriesUpdate={onCategoriesUpdate}
        onComplete={() => {
          onCompleteAssessment();
          navigate('/results');
        }}
        onBack={onBackToDemographics}
      />
    );
  }

  if (currentStep === 'results') {
    return (
      <ResultsDisplay
        categories={categories}
        demographics={demographics}
        onRestart={() => {
          onStartAssessment();
          navigate('/assessment');
        }}
        onBack={() => {
          onBackToDemographics();
          navigate('/assessment');
        }}
        onSignup={onShowSignupForm}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return null;
};

export default AssessmentContent;


import React from 'react';
import IntroductionPage from '../IntroductionPage';
import DemographicsForm from '../DemographicsForm';
import AssessmentForm from '../AssessmentForm';
import ResultsDisplay from './ResultsDisplay';
import { AssessmentStep, Category, Demographics } from '../../utils/assessmentData';

interface AssessmentContentProps {
  currentStep: AssessmentStep;
  categories: Category[];
  demographics: Demographics;
  onStartAssessment: () => void;
  onDemographicsUpdate: (demographics: Demographics) => void;
  onContinueToAssessment: () => void;
  onBackToIntro: () => void;
  onBackToDemographics: () => void;
  onCategoriesUpdate: (categories: Category[]) => void;
  onCompleteAssessment: () => void;
  onShowSignupForm: () => void;
  isAuthenticated: boolean;
}

const AssessmentContent: React.FC<AssessmentContentProps> = ({
  currentStep,
  categories,
  demographics,
  onStartAssessment,
  onDemographicsUpdate,
  onContinueToAssessment,
  onBackToIntro,
  onBackToDemographics,
  onCategoriesUpdate,
  onCompleteAssessment,
  onShowSignupForm,
  isAuthenticated
}) => {
  if (currentStep === 'intro') {
    return (
      <IntroductionPage 
        categories={categories}
        onStartAssessment={onStartAssessment}
      />
    );
  }

  if (currentStep === 'demographics') {
    return (
      <DemographicsForm 
        demographics={demographics}
        onDemographicsUpdate={onDemographicsUpdate}
        onContinue={onContinueToAssessment}
        onBack={onBackToIntro}
      />
    );
  }

  if (currentStep === 'assessment') {
    return (
      <AssessmentForm 
        categories={categories}
        onCategoriesUpdate={onCategoriesUpdate}
        onComplete={onCompleteAssessment}
        onBack={onBackToDemographics}
      />
    );
  }

  if (currentStep === 'results') {
    return (
      <ResultsDisplay
        categories={categories}
        demographics={demographics}
        onRestart={onStartAssessment}
        onBack={onBackToDemographics}
        onSignup={onShowSignupForm}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return null;
};

export default AssessmentContent;

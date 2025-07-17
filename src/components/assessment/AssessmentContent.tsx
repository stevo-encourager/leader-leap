import React from 'react';
import { useNavigate } from 'react-router-dom';
import IntroductionPage from '../IntroductionPage';
import DemographicsForm from '../DemographicsForm';
import AssessmentForm from '../AssessmentForm';
import ResultsDisplay from './ResultsDisplay';
import AssessmentInstructions from '../AssessmentInstructions';
import { AssessmentStep, Category, Demographics } from '../../utils/assessmentData';
import { useState } from 'react';
import { saveAssessmentResults, TEST_ASSESSMENT_ID } from '@/services/assessment';
import { useAuth } from '@/contexts/AuthContext';

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
  initialActiveCategory?: number;
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
  isAuthenticated,
  initialActiveCategory
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
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
        onComplete={async () => {
          setIsSaving(true);
          setSaveError(null);
          try {
            let result;
            if (user && user.id === TEST_ASSESSMENT_ID) {
              result = await saveAssessmentResults(categories, demographics, false, TEST_ASSESSMENT_ID);
            } else {
              result = await saveAssessmentResults(categories, demographics);
            }
            if (result.success) {
              setIsSaving(false);
              if (result.data && result.data[0]?.id) {
                // User is authenticated and data was saved to database
                navigate(`/results/${result.data[0].id}`);
              } else {
                // User is not authenticated, data saved locally only
                navigate('/results');
              }
            } else {
              setIsSaving(false);
              setSaveError(result.error || 'Failed to save assessment.');
            }
          } catch (error: any) {
            setIsSaving(false);
            setSaveError(error.message || 'Unexpected error saving assessment.');
          }
        }}
        onBack={onBackToDemographics}
        initialActiveCategory={initialActiveCategory}
      />
    );
  }

  if (isSaving) {
    return <div className="text-center py-12">Saving your assessment...</div>;
  }
  if (saveError) {
    return <div className="text-center py-12 text-red-600">{saveError}</div>;
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

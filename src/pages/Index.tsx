
import React, { useState } from 'react';
import { initialCategories, AssessmentStep, Category, Demographics } from '../utils/assessmentData';
import AssessmentForm from '../components/AssessmentForm';
import ResultsDashboard from '../components/ResultsDashboard';
import IntroductionPage from '../components/IntroductionPage';
import DemographicsForm from '../components/DemographicsForm';
import { CircleGauge, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [showGuidance, setShowGuidance] = useState(true);

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  const handleDemographicsUpdate = (updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
  };

  const handleStartAssessment = () => {
    setCurrentStep('demographics');
    setShowGuidance(true);
  };

  const handleContinueToAssessment = () => {
    setCurrentStep('assessment');
    setShowGuidance(true);
  };

  const handleBackToIntro = () => {
    setCurrentStep('intro');
  };

  const handleBackToDemographics = () => {
    setCurrentStep('demographics');
  };

  const handleCompleteAssessment = () => {
    setCurrentStep('results');
  };

  const dismissGuidance = () => {
    setShowGuidance(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="assessment-container">
        {currentStep === 'intro' && (
          <IntroductionPage 
            categories={categories}
            onStartAssessment={handleStartAssessment}
          />
        )}

        {currentStep === 'demographics' && (
          <>
            {showGuidance && (
              <Alert 
                className="mb-6 bg-encourager/5 border-encourager/20 animate-fade-in"
              >
                <AlertCircle className="h-4 w-4 text-encourager" />
                <AlertTitle className="text-encourager">Getting Started</AlertTitle>
                <AlertDescription className="text-slate-700">
                  Please provide some basic information about yourself. This helps customize your assessment experience.
                </AlertDescription>
                <button 
                  onClick={dismissGuidance} 
                  className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
                >
                  ×
                </button>
              </Alert>
            )}
            <DemographicsForm 
              demographics={demographics}
              onDemographicsUpdate={handleDemographicsUpdate}
              onContinue={handleContinueToAssessment}
              onBack={handleBackToIntro}
            />
          </>
        )}

        {currentStep === 'assessment' && (
          <>
            {showGuidance && (
              <Alert 
                className="mb-6 bg-encourager/5 border-encourager/20 animate-fade-in"
              >
                <AlertCircle className="h-4 w-4 text-encourager" />
                <AlertTitle className="text-encourager">Rate Your Leadership Skills</AlertTitle>
                <AlertDescription className="text-slate-700">
                  For each leadership skill, rate your current ability and target level on a scale from 1 to 10.
                  Be honest with yourself - this will help identify your most important development areas.
                </AlertDescription>
                <button 
                  onClick={dismissGuidance} 
                  className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
                >
                  ×
                </button>
              </Alert>
            )}
            <AssessmentForm 
              categories={categories}
              onCategoriesUpdate={handleCategoriesUpdate}
              onComplete={handleCompleteAssessment}
              onBack={handleBackToDemographics}
            />
          </>
        )}

        {currentStep === 'results' && (
          <ResultsDashboard 
            categories={categories}
            demographics={demographics}
            onRestart={handleStartAssessment}
            onBack={handleBackToDemographics}
          />
        )}
      </main>

      <footer className="py-6 border-t mt-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <CircleGauge className="text-encourager-accent" size={18} strokeWidth={1.5} />
            Leadership Assessment Tool &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

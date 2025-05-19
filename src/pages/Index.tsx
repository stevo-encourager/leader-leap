
import React, { useState } from 'react';
import { initialCategories, AssessmentStep, Category, Demographics } from '../utils/assessmentData';
import AssessmentForm from '../components/AssessmentForm';
import ResultsDashboard from '../components/ResultsDashboard';
import IntroductionPage from '../components/IntroductionPage';
import DemographicsForm from '../components/DemographicsForm';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  const handleDemographicsUpdate = (updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
  };

  const handleStartAssessment = () => {
    setCurrentStep('demographics');
  };

  const handleContinueToAssessment = () => {
    setCurrentStep('assessment');
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
              alt="Encourager Logo" 
              className="h-12 object-contain" 
            />
            <h1 className="text-2xl md:text-3xl font-bold text-encourager">Leadership Assessment</h1>
          </div>
        </div>
      </header>

      <main className="assessment-container">
        {currentStep === 'intro' && (
          <IntroductionPage 
            categories={categories}
            onStartAssessment={handleStartAssessment}
          />
        )}

        {currentStep === 'demographics' && (
          <DemographicsForm 
            demographics={demographics}
            onDemographicsUpdate={handleDemographicsUpdate}
            onContinue={handleContinueToAssessment}
            onBack={handleBackToIntro}
          />
        )}

        {currentStep === 'assessment' && (
          <AssessmentForm 
            categories={categories}
            onCategoriesUpdate={handleCategoriesUpdate}
            onComplete={handleCompleteAssessment}
            onBack={handleBackToDemographics}
          />
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
          Leadership Assessment Tool &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

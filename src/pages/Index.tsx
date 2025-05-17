
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleCompleteAssessment = () => {
    setCurrentStep('results');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Leadership Assessment Tool</h1>
          <p className="text-slate-200 mt-2">Identify gaps between your current and desired leadership abilities</p>
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
          />
        )}

        {currentStep === 'results' && (
          <ResultsDashboard 
            categories={categories}
            demographics={demographics}
            onRestart={handleStartAssessment}
          />
        )}
      </main>

      <footer className="py-6 border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          Leadership Assessment Tool &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

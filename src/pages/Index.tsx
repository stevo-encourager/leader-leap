
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initialCategories, AssessmentStep, Category } from '../utils/assessmentData';
import AssessmentForm from '../components/AssessmentForm';
import ResultsDashboard from '../components/ResultsDashboard';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const handleStartAssessment = () => {
    setCurrentStep('assessment');
    // Reset categories when starting a new assessment
    setCategories(JSON.parse(JSON.stringify(initialCategories)));
  };

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
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
          <div className="fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to the Leadership Assessment</CardTitle>
                <CardDescription>
                  This assessment will help you identify gaps between your current leadership skills and where you want to be.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>This assessment covers four key areas of leadership:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <strong>{category.title}</strong> - {category.description}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4">For each skill, you will rate:</p>
                  <div className="pl-5">
                    <p><strong>Current level:</strong> Your current proficiency in this skill</p>
                    <p><strong>Desired level:</strong> Your target proficiency in this skill</p>
                  </div>
                  <p>The difference between these ratings represents your skill gap and potential development area.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" onClick={handleStartAssessment}>
                  Start Assessment
                </Button>
              </CardFooter>
            </Card>
          </div>
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

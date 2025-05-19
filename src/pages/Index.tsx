
import React, { useState, useEffect } from 'react';
import { initialCategories, AssessmentStep, Category, Demographics } from '../utils/assessmentData';
import AssessmentForm from '../components/AssessmentForm';
import ResultsDashboard from '../components/ResultsDashboard';
import IntroductionPage from '../components/IntroductionPage';
import DemographicsForm from '../components/DemographicsForm';
import AuthForm from '../components/auth/AuthForm';
import UserHeader from '../components/auth/UserHeader';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { saveAssessmentResults, getLatestAssessmentResults } from '@/services/assessmentService';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    // When user logs in, check if they have previous results
    if (user && currentStep === 'results') {
      handleSaveResults();
    }
  }, [user, currentStep]);

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
    
    // If user is logged in, save results automatically
    if (user) {
      handleSaveResults();
    }
  };
  
  const handleSaveResults = async () => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }
    
    const result = await saveAssessmentResults(categories, demographics);
    
    if (result.success) {
      toast({
        title: "Results saved",
        description: "Your assessment results have been saved to your account.",
      });
    } else {
      toast({
        title: "Error saving results",
        description: result.error || "An error occurred while saving your results.",
        variant: "destructive",
      });
    }
  };
  
  const handleLoadPreviousResults = async () => {
    setLoadingPreviousResults(true);
    
    try {
      const result = await getLatestAssessmentResults();
      
      if (result.success && result.data) {
        setCategories(result.data.categories);
        setDemographics(result.data.demographics);
        setCurrentStep('results');
        
        toast({
          title: "Previous results loaded",
          description: "Your most recent assessment results have been loaded.",
        });
      } else {
        toast({
          title: "No previous results found",
          description: "You don't have any saved assessment results yet.",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading results",
        description: "An error occurred while loading your previous results.",
        variant: "destructive",
      });
    } finally {
      setLoadingPreviousResults(false);
    }
  };
  
  const handleCloseAuthForm = () => {
    setShowAuthForm(false);
  };

  // Wait for auth to initialize before rendering
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
          <p className="mt-2 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
        {/* User header (when logged in) */}
        <UserHeader />
        
        {/* Show auth form when user tries to save results without being logged in */}
        {showAuthForm && (
          <div className="mb-8">
            <AuthForm defaultTab="signup" />
            <div className="text-center mt-4">
              <Button variant="ghost" onClick={handleCloseAuthForm}>
                Skip Sign Up for Now
              </Button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        {!showAuthForm && (
          <>
            {user && currentStep === 'intro' && (
              <div className="mb-6 flex justify-end">
                <Button 
                  variant="outline" 
                  className="text-encourager border-encourager"
                  onClick={handleLoadPreviousResults}
                  disabled={loadingPreviousResults}
                >
                  {loadingPreviousResults ? (
                    <CircleGauge className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Load Previous Results
                </Button>
              </div>
            )}
            
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
              <>
                {!user && (
                  <div className="mb-6 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                    <p className="text-slate-700 mb-2">
                      <strong>Want to save your results and access them later?</strong>
                    </p>
                    <Button 
                      variant="encourager" 
                      size="sm" 
                      onClick={() => setShowAuthForm(true)}
                    >
                      Create an Account
                    </Button>
                  </div>
                )}
                
                <ResultsDashboard 
                  categories={categories}
                  demographics={demographics}
                  onRestart={handleStartAssessment}
                  onBack={handleBackToDemographics}
                />
              </>
            )}
          </>
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

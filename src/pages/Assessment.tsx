
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '../components/auth/UserHeader';
import AuthSection from '@/components/assessment/AuthSection';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import DemographicsForm from '@/components/DemographicsForm';
import AssessmentForm from '@/components/AssessmentForm';
import ResultsDisplay from '@/components/assessment/ResultsDisplay';
import { useAssessment } from '@/hooks/useAssessment';

type AssessmentPageStep = 'demographics' | 'assessment' | 'results';

const Assessment = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    handleDemographicsUpdate,
    handleCategoriesUpdate,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment,
    handleCloseAuthForm,
    handleShowSignupForm
  } = useAssessment();
  
  const { user, loading } = useAuth();

  // Redirect to home if we're on the intro step
  useEffect(() => {
    if (currentStep === 'intro') {
      navigate('/');
    }
  }, [currentStep, navigate]);

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

  // Determine which step to show
  const currentPageStep: AssessmentPageStep = 
    currentStep === 'demographics' ? 'demographics' :
    currentStep === 'assessment' ? 'assessment' : 'results';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
        {/* User header (when logged in) */}
        <UserHeader />
        
        {/* Show auth form when user tries to save results without being logged in */}
        {showAuthForm && (
          <AuthSection onClose={handleCloseAuthForm} />
        )}
        
        {/* Main content */}
        {!showAuthForm && (
          <>
            {currentPageStep === 'demographics' && (
              <DemographicsForm 
                demographics={demographics}
                onDemographicsUpdate={handleDemographicsUpdate}
                onContinue={handleContinueToAssessment}
                onBack={handleBackToIntro}
              />
            )}
            
            {currentPageStep === 'assessment' && (
              <AssessmentForm 
                categories={categories}
                onCategoriesUpdate={handleCategoriesUpdate}
                onComplete={handleCompleteAssessment}
                onBack={handleBackToDemographics}
              />
            )}
            
            {currentPageStep === 'results' && (
              <ResultsDisplay
                categories={categories}
                demographics={demographics}
                onRestart={() => navigate('/')}
                onBack={handleBackToDemographics}
                onSignup={handleShowSignupForm}
                isAuthenticated={!!user}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Assessment;

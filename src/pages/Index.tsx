
import React, { useEffect } from 'react';
import { initialCategories } from '../utils/assessmentData'; 
import UserHeader from '../components/auth/UserHeader';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadResultsButton from '@/components/assessment/LoadResultsButton';
import AuthSection from '@/components/assessment/AuthSection';
import AssessmentContent from '@/components/assessment/AssessmentContent';
import Footer from '@/components/layout/Footer';
import Navigation from '@/components/layout/Navigation';
import { useAssessment } from '@/hooks/useAssessment';

const Index = () => {
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    loadingPreviousResults,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    handleStartAssessment,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm
  } = useAssessment();
  
  const { user, loading } = useAuth();
  
  // Initialize categories from initial data
  useEffect(() => {
    handleCategoriesUpdate(initialCategories);
  }, []);

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
            {user && currentStep === 'intro' && (
              <LoadResultsButton 
                onLoadPreviousResults={handleLoadPreviousResults}
                isLoading={loadingPreviousResults}
              />
            )}
            
            <AssessmentContent
              currentStep={currentStep}
              categories={categories}
              demographics={demographics}
              onStartAssessment={handleStartAssessment}
              onDemographicsUpdate={handleDemographicsUpdate}
              onContinueToAssessment={handleContinueToAssessment}
              onBackToIntro={handleBackToIntro}
              onBackToDemographics={handleBackToDemographics}
              onCategoriesUpdate={handleCategoriesUpdate}
              onCompleteAssessment={handleCompleteAssessment}
              onShowSignupForm={handleShowSignupForm}
              isAuthenticated={!!user}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

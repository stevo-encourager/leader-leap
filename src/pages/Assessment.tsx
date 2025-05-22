
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
import { useAssessment } from '@/hooks/useAssessment';

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
    handleCloseAuthForm
  } = useAssessment();
  
  const { user, loading } = useAuth();

  // Log categories data for debugging - moved OUTSIDE conditional rendering
  // This ensures hooks are called in the same order on every render
  useEffect(() => {
    if (categories && Array.isArray(categories)) {
      console.log("Assessment page - Categories:", categories);
      console.log("Assessment page - Categories valid:", categories.length > 0);
      if (categories.length > 0) {
        console.log("Assessment page - First category:", categories[0]);
      }
    }
  }, [categories]);

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

  // Verify categories data before rendering assessment form
  const hasValidCategories = categories && Array.isArray(categories) && categories.length > 0;

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
            {currentStep === 'demographics' && (
              <DemographicsForm 
                demographics={demographics}
                onDemographicsUpdate={handleDemographicsUpdate}
                onContinue={handleContinueToAssessment}
                onBack={() => {
                  handleBackToIntro();
                  navigate('/');
                }}
              />
            )}
            
            {currentStep === 'assessment' && hasValidCategories && (
              <AssessmentForm 
                categories={categories}
                onCategoriesUpdate={handleCategoriesUpdate}
                onComplete={() => {
                  handleCompleteAssessment();
                  navigate('/results');
                }}
                onBack={handleBackToDemographics}
              />
            )}
            
            {currentStep === 'assessment' && !hasValidCategories && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
                <h3 className="font-bold mb-2">Error Loading Assessment</h3>
                <p>There was a problem loading the assessment categories. Please try again.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                >
                  Return to Home
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Assessment;

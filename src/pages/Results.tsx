
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/auth/UserHeader';
import AuthSection from '@/components/assessment/AuthSection';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ResultsDisplay from '@/components/assessment/ResultsDisplay';
import { useAssessment } from '@/hooks/useAssessment';
import { useSpecificAssessment } from '@/hooks/useSpecificAssessment';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import AssessmentLoading from '@/components/assessment/AssessmentLoading';
import InvalidResultsMessage from '@/components/assessment/InvalidResultsMessage';

const Results = () => {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();
  const { user, loading } = useAuth();
  const saveTriggeredRef = useRef(false);
  
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    handleCloseAuthForm,
    handleShowSignupForm,
    handleStartAssessment,
    handleBackToDemographics,
    handleSaveResults
  } = useAssessment();

  const {
    loadingSpecificAssessment,
    specificAssessmentData,
    error: specificAssessmentError
  } = useSpecificAssessment(assessmentId);

  // Use our updated hook to handle assessment data
  const {
    displayCategories,
    displayDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading
  } = useAssessmentData(
    assessmentId,
    specificAssessmentData,
    loadingSpecificAssessment,
    categories,
    demographics
  );

  // Effect to handle result saving when user is logged in and viewing results
  useEffect(() => {
    // Only attempt to save if:
    // 1. User is logged in
    // 2. We're on the results page (currentStep is 'results')
    // 3. We're not viewing a specific assessment (no assessmentId)
    // 4. We haven't already triggered a save in this component mount
    // 5. We have valid data to save
    if (user && 
        currentStep === 'results' && 
        !assessmentId && 
        !saveTriggeredRef.current && 
        categories && categories.length > 0) {
      
      console.log('Triggering assessment save from Results page');
      saveTriggeredRef.current = true;
      
      // Use setTimeout to avoid race conditions and ensure this runs after render
      setTimeout(() => {
        handleSaveResults();
      }, 0);
    }
  }, [user, currentStep, assessmentId, categories, handleSaveResults]);

  // Wait for auth and data to initialize before rendering
  if (loading || isAssessmentDataLoading) {
    return <AssessmentLoading />;
  }

  // Error state for specific assessment ID
  if (assessmentId && specificAssessmentError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
          <UserHeader />
          <InvalidResultsMessage 
            onRestart={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
            onBack={() => navigate('/previous-assessments')}
            errorType={specificAssessmentError}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Check if we have valid assessment data to display
  const hasValidData = (assessmentId && specificAssessmentData && specificAssessmentData.categories.length > 0) || 
                      (!assessmentId && categories && categories.length > 0);
  
  // If no valid assessment data is available
  if (!hasValidData) {
    console.log("Results page - No valid assessment data available:", {
      assessmentId,
      hasSpecificData: Boolean(specificAssessmentData),
      hasCategories: Boolean(categories && categories.length > 0)
    });
    
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
          <UserHeader />
          <InvalidResultsMessage 
            onRestart={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
            onBack={assessmentId ? () => navigate('/previous-assessments') : undefined}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // If assessment data is valid, render the results
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
        
        {/* Results content */}
        {!showAuthForm && (
          <ResultsDisplay
            categories={displayCategories}
            demographics={displayDemographics}
            onRestart={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
            onBack={() => {
              if (assessmentId) {
                navigate('/previous-assessments');
              } else {
                handleBackToDemographics();
                navigate('/assessment');
              }
            }}
            onSignup={handleShowSignupForm}
            isAuthenticated={!!user}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Results;


import React from 'react';
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
import ErrorDisplay from '@/components/assessment/ErrorDisplay';

const Results = () => {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();
  const { user, loading } = useAuth();
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    handleCloseAuthForm,
    handleShowSignupForm,
    handleStartAssessment,
    handleBackToDemographics
  } = useAssessment();

  const {
    loadingSpecificAssessment,
    specificAssessmentData
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

  // Wait for auth and data to initialize before rendering
  if (loading || isAssessmentDataLoading) {
    return <AssessmentLoading />;
  }

  // Error state for specific assessment ID
  if (assessmentId && !isAssessmentDataValid) {
    return (
      <ErrorDisplay
        title="Unable to load assessment results"
        message="The assessment data could not be loaded or has an invalid format."
        buttonText="Back to Previous Assessments"
        onButtonClick={() => navigate('/previous-assessments')}
      />
    );
  }

  // No assessment results available
  if (!assessmentId && !isAssessmentDataValid) {
    return (
      <ErrorDisplay
        title="No Assessment Results Available"
        message="It looks like you haven't completed an assessment yet or your results weren't saved."
        buttonText="Start New Assessment"
        onButtonClick={() => {
          handleStartAssessment();
          navigate('/assessment');
        }}
      />
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
        
        {/* Results content */}
        {!showAuthForm && isAssessmentDataValid && (
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

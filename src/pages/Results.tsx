
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/auth/UserHeader';
import AuthSection from '@/components/assessment/AuthSection';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ResultsDisplay from '@/components/assessment/ResultsDisplay';
import { useAssessment } from '@/hooks/useAssessment';

const Results = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    handleBackToDemographics,
    handleCloseAuthForm,
    handleShowSignupForm,
    handleStartAssessment
  } = useAssessment();
  
  const { user, loading } = useAuth();

  // Redirect if not on results step
  useEffect(() => {
    console.log(`Current step in Results: ${currentStep}`);
    if (currentStep !== 'results') {
      console.log("Redirecting to / from Results page because not on results step");
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

  const handleRestart = () => {
    handleStartAssessment();
  };

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
            categories={categories}
            demographics={demographics}
            onRestart={handleRestart}
            onBack={() => navigate('/assessment')}
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

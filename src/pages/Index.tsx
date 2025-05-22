
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { allCategories } from '@/utils/assessmentCategories';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadResultsButton from '@/components/assessment/LoadResultsButton';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import IntroductionPage from '@/components/IntroductionPage';
import { useAssessment } from '@/hooks/useAssessment';

const Index = () => {
  const navigate = useNavigate();
  const {
    handleCategoriesUpdate,
    handleStartAssessment,
    handleLoadPreviousResults,
    loadingPreviousResults
  } = useAssessment();
  
  const { user, loading } = useAuth();
  
  // Initialize categories from initial data
  useEffect(() => {
    // Create a fresh copy of the categories with reset ratings
    const freshCategories = JSON.parse(JSON.stringify(allCategories));
    handleCategoriesUpdate(freshCategories);
  }, [handleCategoriesUpdate]);

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
        {user && (
          <LoadResultsButton 
            onLoadPreviousResults={handleLoadPreviousResults}
            isLoading={loadingPreviousResults}
          />
        )}
        
        <IntroductionPage 
          categories={allCategories}
          onStartAssessment={() => {
            handleStartAssessment();
            navigate('/assessment');
          }}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

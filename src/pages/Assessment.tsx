import React, { useEffect, useState } from 'react';
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
import { toast } from '@/hooks/use-toast';
import AssessmentInstructions from '@/components/AssessmentInstructions';
import AssessmentContent from '@/components/assessment/AssessmentContent';
import SEO from '@/components/SEO';
import { storeLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { allCategories } from '@/utils/assessmentCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/productionLogger';

const Assessment = () => {
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialActiveCategory, setInitialActiveCategory] = useState<number | undefined>(undefined);
  
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
    handleContinueToInstructions
  } = useAssessment();
  
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  // Check if we're in development/staging (not production)
  const isDevelopment = import.meta.env.DEV || 
    (window.location.hostname !== 'leader-leap.com' && 
     window.location.hostname !== 'www.leader-leap.com' &&
     !window.location.hostname.includes('lovable.dev'));

  // Test function to generate demographic data and assessment scores
  const generateTestData = () => {
    
    // Generate realistic demographic data
    const testDemographics: Demographics = {
      role: "Manager",
      yearsOfExperience: "4-7 years",
      industry: "Technology"
    };
    

    // Generate realistic assessment scores for all categories and skills
    const testCategories = allCategories.map(category => ({
      ...category,
      skills: category.skills.map(skill => ({
        ...skill,
        ratings: {
          current: Math.floor(Math.random() * 4) + 4, // Random score between 4-7
          desired: Math.floor(Math.random() * 3) + 7   // Random score between 7-9
        }
      }))
    }));

    // Update the assessment state with test data
    handleDemographicsUpdate(testDemographics);
    
    handleCategoriesUpdate(testCategories);
    
    // Store the test data locally
    const stored = storeLocalAssessmentData(testCategories, testDemographics);
    
    // Set initial active category to the last category (index 9 for 10 categories)
    setInitialActiveCategory(allCategories.length - 1);
    
    // Continue directly to assessment step
    handleContinueToInstructions();
    handleContinueToAssessment();
    
    toast({
      title: "Test data generated",
      description: "Assessment populated with test data. You're now on the last page with all data filled in.",
    });
  };

  // Log categories data for debugging and error detection
  useEffect(() => {
    if (!categories || !Array.isArray(categories)) {
      setLoadError("Categories data is invalid or missing");
      return;
    }
    
    if (categories.length === 0) {
      setLoadError("No assessment categories were loaded");
      return;
    }
    
    if (categories.length > 0) {
      // Check if the first category has the expected properties
      const firstCategory = categories[0];
      if (!firstCategory.id || !firstCategory.title || !Array.isArray(firstCategory.skills)) {
        setLoadError("Assessment categories have an invalid format");
        return;
      }
      
      // Clear any previous error if categories data looks valid
      setLoadError(null);
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
    <>
      <SEO title="Assessment - Leader Leap" description="Leadership assessment (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-5xl px-4 py-8'}`}>
          {/* User header (when logged in) */}
          <UserHeader />
          
          {/* Show auth form when user tries to save results without being logged in */}
          {showAuthForm && (
            <AuthSection onClose={handleCloseAuthForm} />
          )}
          
          {/* Main content */}
          {!showAuthForm && (
            <>
              {/* Test button - only show on demographics step in development/staging */}
              {currentStep === 'demographics' && isDevelopment && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Testing Mode</h3>
                      <p className="text-sm text-blue-700">Skip the assessment and generate test data (Development Only)</p>
                    </div>
                    <button
                      onClick={generateTestData}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Generate demographic info & scores
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 'demographics' && (
                <DemographicsForm 
                  demographics={demographics}
                  onDemographicsUpdate={handleDemographicsUpdate}
                  onContinue={handleContinueToInstructions}
                  onBack={() => {
                    handleBackToIntro();
                    navigate('/');
                  }}
                />
              )}
              
              {currentStep === 'instructions' && (
                <AssessmentInstructions onContinue={handleContinueToAssessment} onBack={handleBackToDemographics} />
              )}
              
              {currentStep === 'assessment' && hasValidCategories && (
                <AssessmentContent
                  currentStep={currentStep}
                  categories={categories}
                  demographics={demographics}
                  onStartAssessment={() => {
                    handleBackToIntro();
                    navigate('/');
                  }}
                  onDemographicsUpdate={handleDemographicsUpdate}
                  onContinueToAssessment={handleContinueToAssessment}
                  onContinueToInstructions={handleContinueToInstructions}
                  onBackToIntro={handleBackToIntro}
                  onBackToDemographics={handleBackToDemographics}
                  onCategoriesUpdate={handleCategoriesUpdate}
                  onCompleteAssessment={handleCompleteAssessment}
                  isAuthenticated={!!user}
                  initialActiveCategory={initialActiveCategory}
                />
              )}
              
              {currentStep === 'assessment' && !hasValidCategories && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
                  <h3 className="font-bold mb-2">Error Loading Assessment</h3>
                  <p>There was a problem loading the assessment categories. Please try again.</p>
                  {loadError && (
                    <p className="mt-2 text-sm font-medium">Error details: {loadError}</p>
                  )}
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
    </>
  );
};

export default Assessment;

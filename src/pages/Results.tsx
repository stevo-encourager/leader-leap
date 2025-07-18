
import React, { useEffect, useRef, useState } from 'react';
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
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import SEO from '@/components/SEO';
import { useIsMobile } from '@/hooks/use-mobile';

const Results = () => {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();
  const { user, loading } = useAuth();
  const saveTriggeredRef = useRef(false);
  const localDataLoadedRef = useRef(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isInitialDataChecked, setIsInitialDataChecked] = useState(false);
  const [showMandatoryAuth, setShowMandatoryAuth] = useState(false);
  const isMobile = useIsMobile();
  
  // Log the assessment ID for debugging
  console.log('Results page - URL assessmentId parameter:', assessmentId);
  
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    handleCloseAuthForm,
    handleShowSignupForm,
    handleStartAssessment,
    handleBackToDemographics,
    handleSaveResults
  } = useAssessment();

  // Ensure page scrolls to top when component mounts or when assessment data is ready
  useEffect(() => {
    // Scroll to top immediately when component mounts
    window.scrollTo(0, 0);
    
    const readyTimer = setTimeout(() => {
      setIsPageReady(true);
      // Ensure we're at the top after page is ready
      window.scrollTo(0, 0);
    }, 300);

    return () => clearTimeout(readyTimer);
  }, []);

  // Additional scroll to top when valid assessment data is available
  useEffect(() => {
    if (isPageReady && (categories?.length > 0 || assessmentId)) {
      // Ensure page is at the top when results are displayed
      window.scrollTo(0, 0);
    }
  }, [isPageReady, categories, assessmentId]);

  // Log assessment state data with more detail
  useEffect(() => {
    if (!isPageReady) return;
    
    console.log("Results page - Render triggered with:");
    console.log("Results page - assessmentId:", assessmentId);
    console.log("Results page - currentStep:", currentStep);
    console.log("Results page - user authenticated:", !!user);
    console.log("Results page - Categories from context:", categories);
    console.log("Results page - Categories count:", categories?.length || 0);
    
    // Try to load local data if categories are empty AND we're not viewing a specific assessment
    if ((!categories || categories.length === 0) && !localDataLoadedRef.current && !assessmentId) {
      console.log("Results page - Trying to load from local storage");
      const localData = getLocalAssessmentData();
      if (localData && localData.categories && localData.categories.length > 0) {
        console.log("Results page - Found local assessment data, using that");
        handleCategoriesUpdate(localData.categories);
        if (localData.demographics) {
          handleDemographicsUpdate(localData.demographics);
        }
        localDataLoadedRef.current = true;
      }
    }
    
    // CRITICAL FIX: If we have categories but they have no ratings, try to load from local storage
    if (categories && categories.length > 0 && !localDataLoadedRef.current && !assessmentId) {
      // Check if current categories have any ratings
      const hasRatings = categories.some(cat => 
        cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && 
          skill.ratings.current > 0 && 
          skill.ratings.desired > 0
        )
      );
      
      if (!hasRatings) {
        console.log("Results page - Categories present but no ratings, loading from local storage");
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log("Results page - Found local assessment data with ratings, using that");
          handleCategoriesUpdate(localData.categories);
          if (localData.demographics) {
            handleDemographicsUpdate(localData.demographics);
          }
          localDataLoadedRef.current = true;
        }
      }
    }
    
    setIsInitialDataChecked(true);
  }, [currentStep, categories, demographics, assessmentId, user, handleCategoriesUpdate, handleDemographicsUpdate, isPageReady]);

  // Load specific assessment if ID is provided
  const {
    loadingSpecificAssessment,
    specificAssessmentData,
    error: specificAssessmentError
  } = useSpecificAssessment(assessmentId);

  // Process assessment data with our hook
  const {
    displayCategories,
    displayDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading,
    debugData
  } = useAssessmentData(
    assessmentId,
    specificAssessmentData,
    loadingSpecificAssessment,
    categories,
    demographics
  );

  // Check if we need to show mandatory auth for new assessments
  useEffect(() => {
    if (!loading && isPageReady && isInitialDataChecked) {
      // Show auth prompt for unauthenticated users with local data (test users)
      const localData = getLocalAssessmentData();
      const hasLocalData = localData && localData.categories && localData.categories.length > 0;
      
      if (!assessmentId && !user && hasLocalData) {
        console.log('Results page - Unauthenticated user with local data, showing auth prompt');
        setShowMandatoryAuth(true);
      } else if (!assessmentId && !user && !hasLocalData && categories?.length > 0) {
        console.log('Results page - New assessment detected, requiring authentication');
        setShowMandatoryAuth(true);
      } else {
        setShowMandatoryAuth(false);
      }
    }
  }, [loading, isPageReady, isInitialDataChecked, assessmentId, user, categories]);

  // Handle successful authentication
  const handleAuthSuccess = () => {
    console.log('Results page - Authentication successful, hiding auth form');
    setShowMandatoryAuth(false);
    handleCloseAuthForm();
  };

  // CRITICAL FIX: Only save for NEW assessments, never for existing ones being viewed
  // Also ensure we don't save multiple times in the same session
  useEffect(() => {
    // IMMEDIATELY RETURN if we're viewing an existing assessment
    if (assessmentId) {
      console.log('Results page - Viewing existing assessment, NEVER save to prevent duplicates');
      return;
    }
    
    // IMMEDIATELY RETURN if we've already triggered a save in this session
    if (saveTriggeredRef.current) {
      console.log('Results page - Save already triggered in this session, skipping');
      return;
    }
    
    // Only attempt to save if:
    // 1. User is logged in
    // 2. On results page (currentStep === 'results')  
    // 3. NOT viewing an existing assessment (no assessmentId) - already checked above
    // 4. Haven't already triggered save - already checked above
    // 5. Page is ready and initial data is checked
    // 6. We have valid categories with actual ratings
    if (user && 
        currentStep === 'results' && 
        isPageReady &&
        isInitialDataChecked &&
        categories && 
        categories.length > 0) {
      
      // Verify we have actual rating data before saving
      const hasValidRatings = categories.some(cat => 
        cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && 
          skill.ratings.current > 0 && 
          skill.ratings.desired > 0
        )
      );
      
      if (hasValidRatings) {
        console.log('Results page - Triggering one-time assessment save for NEW assessment');
        saveTriggeredRef.current = true;
        
        // Delay to ensure all state is properly set
        setTimeout(() => {
          handleSaveResults();
        }, 300);
      } else {
        console.log('Results page - Categories present but no valid ratings found, checking local storage');
        
        // Try one more time to load from local storage
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log('Results page - Found local assessment data, using that before save');
          handleCategoriesUpdate(localData.categories);
          if (localData.demographics) {
            handleDemographicsUpdate(localData.demographics);
          }
          
          // Try saving after a short delay, but only once
          setTimeout(() => {
            if (!saveTriggeredRef.current) {
              saveTriggeredRef.current = true;
              handleSaveResults();
            }
          }, 400);
        } else {
          console.log('Results page - No valid rating data available, cannot save');
        }
      }
    } 
    // For guest users, just ensure local storage is updated without triggering auth errors
    else if (!user && 
             currentStep === 'results' && 
             !saveTriggeredRef.current && 
             categories && 
             categories.length > 0 &&
             isPageReady) {
      console.log('Results page - Guest user, ensuring local storage is updated');
      saveTriggeredRef.current = true;
    }
  }, [user, currentStep, assessmentId, categories, handleSaveResults, handleCategoriesUpdate, handleDemographicsUpdate, isPageReady, isInitialDataChecked]);

  // Wait for auth, data, and page readiness before rendering
  if (loading || !isPageReady || (!isInitialDataChecked && !assessmentId)) {
    return <AssessmentLoading />;
  }

  // Show specific loading state for assessment data
  if (assessmentId && loadingSpecificAssessment) {
    return <AssessmentLoading />;
  }

  // Error state for specific assessment ID
  if (assessmentId && specificAssessmentError) {
    console.error("Results page - Showing error for specific assessment:", specificAssessmentError);
    return (
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-5xl px-4 py-8'}`}>
          <UserHeader />
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              There was a problem loading the requested assessment. Please try again or view another assessment.
            </AlertDescription>
          </Alert>
          <InvalidResultsMessage 
            onRestart={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
            onBack={() => navigate('/previous-assessments')}
            errorType={specificAssessmentError}
            debugData={debugData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Show mandatory authentication for new assessments
  if (showMandatoryAuth) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-5xl px-4 py-8'}`}>
          <UserHeader />
          <AuthSection onClose={handleAuthSuccess} mandatory={true} />
        </main>
        <Footer />
      </div>
    );
  }

  // Determine what data to use for display
  let finalDisplayCategories = [];
  let finalDisplayDemographics = {};
  let hasValidData = false;
  
  // Case 1: Viewing specific assessment
  if (assessmentId && specificAssessmentData && specificAssessmentData.categories.length > 0) {
    console.log("Results page - Using specific assessment data");
    finalDisplayCategories = specificAssessmentData.categories;
    finalDisplayDemographics = specificAssessmentData.demographics || {};
    hasValidData = true;
  }
  // Case 2: Using assessment context (just completed)
  else if (!assessmentId && categories && categories.length > 0) {
    console.log("Results page - Using context assessment data");
    finalDisplayCategories = categories;
    finalDisplayDemographics = demographics || {};
    hasValidData = true;
  }
  // Case 3: Using processed display data from the hook
  else if (displayCategories && displayCategories.length > 0) {
    console.log("Results page - Using processed display data");
    finalDisplayCategories = displayCategories;
    finalDisplayDemographics = displayDemographics || {};
    hasValidData = true;
  }
  // Case 4: Try local storage as last resort (only for new assessments, not existing ones)
  else if (!assessmentId) {
    console.log("Results page - Checking local storage for data");
    const localData = getLocalAssessmentData();
    if (localData && localData.categories && localData.categories.length > 0) {
      console.log("Results page - Using local storage data");
      finalDisplayCategories = localData.categories;
      finalDisplayDemographics = localData.demographics || {};
      hasValidData = true;
    }
  }
  
  // If no valid data is available from any source
  if (!hasValidData) {
    console.error("Results page - No valid assessment data available from any source");
    
    return (
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-5xl px-4 py-8'}`}>
          <UserHeader />
          <InvalidResultsMessage 
            onRestart={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
            onBack={assessmentId ? () => navigate('/previous-assessments') : undefined}
            errorType="missing-data" 
            debugData={debugData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Render the results page with available data
  console.log("Results page - Rendering ResultsDisplay with valid data and assessmentId:", assessmentId);
  
  return (
    <>
      <SEO title="Results - Leader Leap" description="Assessment results (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-5xl px-4 py-8'}`}>
          <UserHeader />
          
          {showAuthForm && !showMandatoryAuth && (
            <AuthSection onClose={handleCloseAuthForm} />
          )}
          
          {!showAuthForm && !showMandatoryAuth && (
            <ResultsDisplay
              categories={finalDisplayCategories}
              demographics={finalDisplayDemographics}
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
              assessmentId={assessmentId}
            />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Results;

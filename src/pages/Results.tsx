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
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

const Results = () => {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();
  const { user, loading } = useAuth();
  const saveTriggeredRef = useRef(false);
  const localDataLoadedRef = useRef(false);
  const [isPageReady, setIsPageReady] = React.useState(false);
  
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

  // Add a brief delay to let everything settle before showing content
  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setIsPageReady(true);
    }, 200);

    return () => clearTimeout(readyTimer);
  }, []);

  // Log assessment state data with more detail
  useEffect(() => {
    if (!isPageReady) return;
    
    console.log("Results page - Render triggered with:");
    console.log("Results page - assessmentId:", assessmentId);
    console.log("Results page - currentStep:", currentStep);
    console.log("Results page - user authenticated:", !!user);
    console.log("Results page - Categories from context:", categories);
    console.log("Results page - Categories count:", categories?.length || 0);
    
    // Try to load local data if categories is empty, but only after page is ready
    if ((!categories || categories.length === 0) && !localDataLoadedRef.current) {
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

  // Effect to handle result saving when user is logged in and viewing results
  useEffect(() => {
    // Only attempt to save if:
    // 1. User is logged in (important: don't trigger save to database if not logged in)
    // 2. We're on the results page (currentStep is 'results')
    // 3. We're not viewing a specific assessment (no assessmentId)
    // 4. We haven't already triggered a save in this component mount
    if (user && 
        currentStep === 'results' && 
        !assessmentId && 
        !saveTriggeredRef.current && 
        isPageReady) {
      
      console.log('Results page - Checking if we should save assessment');
      
      // Only save if we have categories with data
      if (categories && categories.length > 0) {
        console.log('Results page - Triggering assessment save with categories:', categories.length);
        saveTriggeredRef.current = true;
        
        // Delay to ensure all state is properly set
        setTimeout(() => {
          handleSaveResults();
        }, 100);
      } else {
        console.error('Results page - Cannot save assessment: categories is empty or invalid');
        
        // CRITICAL FIX: Try one more time to load from local storage
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log('Results page - Found local assessment data, using that before save');
          handleCategoriesUpdate(localData.categories);
          if (localData.demographics) {
            handleDemographicsUpdate(localData.demographics);
          }
          
          // Try saving after a short delay
          setTimeout(() => {
            saveTriggeredRef.current = true;
            handleSaveResults();
          }, 200);
        } else {
          console.log('Results page - No local data available, cannot save');
          console.log('Results page - Categories value:', categories);
        }
      }
    } 
    // For guest users, just ensure local storage is updated without triggering auth errors
    else if (!user && 
             currentStep === 'results' && 
             !assessmentId && 
             !saveTriggeredRef.current && 
             categories && 
             categories.length > 0 &&
             isPageReady) {
      console.log('Results page - Guest user, ensuring local storage is updated');
      saveTriggeredRef.current = true;
      // We'll silently update local storage without database save
    }
  }, [user, currentStep, assessmentId, categories, handleSaveResults, handleCategoriesUpdate, handleDemographicsUpdate, isPageReady]);

  // Wait for auth, data, and page readiness before rendering
  if (loading || isAssessmentDataLoading || !isPageReady) {
    return <AssessmentLoading />;
  }

  // Error state for specific assessment ID
  if (assessmentId && specificAssessmentError) {
    console.error("Results page - Showing error for specific assessment:", specificAssessmentError);
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
            debugData={debugData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Check if we have valid assessment data to display
  const hasValidData = (assessmentId && specificAssessmentData && specificAssessmentData.categories.length > 0) || 
                      (!assessmentId && categories && categories.length > 0);
  
  // Check local storage as fallback
  let localData = null;
  if (!hasValidData) {
    localData = getLocalAssessmentData();
  }
  
  // If no valid assessment data is available even after checking local storage
  if (!hasValidData && (!localData || !localData.categories || localData.categories.length === 0)) {
    console.error("Results page - No valid assessment data available");
    
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
            debugData={debugData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Determine final display data
  const finalDisplayCategories = displayCategories && displayCategories.length > 0 
    ? displayCategories 
    : localData ? localData.categories : [];
    
  const finalDisplayDemographics = Object.keys(displayDemographics || {}).length > 0
    ? displayDemographics
    : localData && localData.demographics ? localData.demographics : {};

  // Render the results page
  console.log("Results page - Rendering ResultsDisplay with valid data");
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
        <UserHeader />
        
        {showAuthForm && (
          <AuthSection onClose={handleCloseAuthForm} />
        )}
        
        {!showAuthForm && (
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
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Results;

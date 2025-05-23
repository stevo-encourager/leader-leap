
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

const Results = () => {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();
  const { user, loading } = useAuth();
  const saveTriggeredRef = useRef(false);
  const localDataLoadedRef = useRef(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isInitialDataChecked, setIsInitialDataChecked] = useState(false);
  
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
    }, 300);

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
    
    // Try to load local data if categories are empty
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

  // Effect to handle result saving when user is logged in and viewing results
  useEffect(() => {
    // Only attempt to save if user is logged in, on results page, and not viewing existing assessment
    if (user && 
        currentStep === 'results' && 
        !assessmentId && 
        !saveTriggeredRef.current && 
        isPageReady &&
        isInitialDataChecked) {
      
      console.log('Results page - Checking if we should save assessment');
      
      // Only save if we have categories with data
      if (categories && categories.length > 0) {
        console.log('Results page - Triggering assessment save with categories:', categories.length);
        saveTriggeredRef.current = true;
        
        // Delay to ensure all state is properly set
        setTimeout(() => {
          handleSaveResults();
        }, 300);
      } else {
        console.error('Results page - Cannot save assessment: categories is empty or invalid');
        
        // Try one more time to load from local storage
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
          }, 400);
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
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
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
  // Case 4: Try local storage as last resort
  else {
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
            errorType="missing-data" 
            debugData={debugData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Render the results page with available data
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

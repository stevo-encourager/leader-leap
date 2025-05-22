
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

  // Log assessment state data with more detail
  useEffect(() => {
    console.log("Results page - Render triggered with:");
    console.log("Results page - assessmentId:", assessmentId);
    console.log("Results page - currentStep:", currentStep);
    console.log("Results page - user authenticated:", !!user);
    console.log("Results page - Categories from context:", categories);
    console.log("Results page - Categories count:", categories?.length || 0);
    
    if (categories && categories.length > 0) {
      // Log the first category as a sample
      console.log("Results page - First category sample:", JSON.stringify(categories[0]));
      
      // Log first skill sample if available
      if (categories[0]?.skills?.length > 0) {
        console.log("Results page - First skill sample:", JSON.stringify(categories[0].skills[0]));
      }
    } else {
      console.warn("Results page - Categories array is empty or undefined");
      
      // CRITICAL FIX: If categories is empty, try to load from local storage
      if (!localDataLoadedRef.current) {
        console.log("Results page - Trying to load from local storage");
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log("Results page - Found local assessment data, using that");
          handleCategoriesUpdate(localData.categories);
          if (localData.demographics) {
            handleDemographicsUpdate(localData.demographics);
          }
          localDataLoadedRef.current = true;
        } else {
          console.warn("Results page - No local assessment data found");
        }
      }
    }
    
    // Try to diagnose why categories might be empty
    if (currentStep === 'results' && (!categories || categories.length === 0)) {
      console.error("Results page - CRITICAL: Expected categories for 'results' step but received empty array");
      
      // Check if we just navigated to this page and need to load data
      if (!saveTriggeredRef.current) {
        console.log("Results page - First render detected, will trigger save/load");
      }
    }
  }, [currentStep, categories, demographics, assessmentId, user, handleCategoriesUpdate, handleDemographicsUpdate]);

  // Load specific assessment if ID is provided
  const {
    loadingSpecificAssessment,
    specificAssessmentData,
    error: specificAssessmentError
  } = useSpecificAssessment(assessmentId);

  // Log information about specific assessment loading
  useEffect(() => {
    if (assessmentId) {
      console.log("Results page - Loading specific assessment:", assessmentId);
      console.log("Results page - Loading status:", loadingSpecificAssessment);
      
      if (specificAssessmentData) {
        console.log("Results page - Specific assessment data loaded:");
        console.log("Results page - Categories from specific assessment:", 
          specificAssessmentData.categories ? JSON.stringify(specificAssessmentData.categories) : "none");
      }
      
      if (specificAssessmentError) {
        console.error("Results page - Error loading specific assessment:", specificAssessmentError);
      }
    }
  }, [assessmentId, loadingSpecificAssessment, specificAssessmentData, specificAssessmentError]);

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
  
  // Log the processed data that will be displayed
  useEffect(() => {
    console.log("Results page - Display data processed:");
    console.log("Results page - Display categories length:", displayCategories?.length || 0);
    console.log("Results page - Is assessment data valid:", isAssessmentDataValid);
    console.log("Results page - Is assessment data loading:", isAssessmentDataLoading);
    
    if (displayCategories && displayCategories.length > 0) {
      console.log("Results page - First display category:", JSON.stringify(displayCategories[0]));
      
      // Log ratings statistics
      const ratingStats = {
        totalCategories: displayCategories.length,
        categoriesWithSkills: 0,
        totalSkills: 0,
        skillsWithRatings: 0
      };
      
      displayCategories.forEach(category => {
        if (category.skills && category.skills.length > 0) {
          ratingStats.categoriesWithSkills++;
          ratingStats.totalSkills += category.skills.length;
          
          category.skills.forEach(skill => {
            if (skill.ratings && 
                (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
                (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)) {
              ratingStats.skillsWithRatings++;
            }
          });
        }
      });
      
      console.log("Results page - Display categories stats:", JSON.stringify(ratingStats));
    } else {
      console.warn("Results page - Display categories is empty or invalid");
    }
  }, [displayCategories, isAssessmentDataValid, isAssessmentDataLoading]);

  // Effect to handle result saving when user is logged in and viewing results
  useEffect(() => {
    // Only attempt to save if:
    // 1. User is logged in
    // 2. We're on the results page (currentStep is 'results')
    // 3. We're not viewing a specific assessment (no assessmentId)
    // 4. We haven't already triggered a save in this component mount
    if (user && 
        currentStep === 'results' && 
        !assessmentId && 
        !saveTriggeredRef.current) {
      
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
  }, [user, currentStep, assessmentId, categories, handleSaveResults, handleCategoriesUpdate, handleDemographicsUpdate]);

  // Wait for auth and data to initialize before rendering
  if (loading || isAssessmentDataLoading) {
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
  
  // CRITICAL FIX: Check local storage as last resort
  let localData = null;
  if (!hasValidData) {
    localData = getLocalAssessmentData();
    if (localData && localData.categories && localData.categories.length > 0) {
      console.log("Results page - Using local assessment data as fallback");
    }
  }
  
  // If no valid assessment data is available even after checking local storage
  if (!hasValidData && (!localData || !localData.categories || localData.categories.length === 0)) {
    console.error("Results page - No valid assessment data available:", {
      assessmentId,
      hasSpecificData: Boolean(specificAssessmentData),
      specificDataLength: specificAssessmentData?.categories?.length || 0,
      hasCategories: Boolean(categories && categories.length > 0),
      categoriesLength: categories?.length || 0,
      localDataAvailable: Boolean(localData),
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
            debugData={debugData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // If we need to use local data instead of context data
  const finalDisplayCategories = displayCategories && displayCategories.length > 0 
    ? displayCategories 
    : localData ? localData.categories : [];
    
  const finalDisplayDemographics = Object.keys(displayDemographics || {}).length > 0
    ? displayDemographics
    : localData && localData.demographics ? localData.demographics : {};

  // If assessment data is valid, render the results
  console.log("Results page - Rendering ResultsDisplay with valid data");
  console.log("Results page - finalDisplayCategories count:", finalDisplayCategories.length);
  
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

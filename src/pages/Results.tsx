
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

  // Log assessment state data
  useEffect(() => {
    console.log("Results page - Current step:", currentStep);
    console.log("Results page - Categories count:", categories?.length || 0);
    console.log("Results page - Has demographics:", !!demographics);
    
    // Serialize categories to avoid circular references
    const safeCategoriesData = categories ? JSON.parse(JSON.stringify(categories)) : null;
    console.log("Results page - Categories data:", safeCategoriesData);
    
    // Log first category as sample (if exists)
    if (categories && categories.length > 0) {
      console.log("Results page - First category title:", categories[0]?.title);
      console.log("Results page - First category skills count:", categories[0]?.skills?.length || 0);
      
      // Log first skill details if available
      if (categories[0]?.skills?.length > 0) {
        const firstSkill = categories[0].skills[0];
        console.log("Results page - First skill:", {
          name: firstSkill.name,
          currentRating: firstSkill.ratings?.current,
          desiredRating: firstSkill.ratings?.desired,
          ratingType: {
            current: typeof firstSkill.ratings?.current,
            desired: typeof firstSkill.ratings?.desired
          }
        });
      }
    }
  }, [currentStep, categories, demographics]);

  const {
    loadingSpecificAssessment,
    specificAssessmentData,
    error: specificAssessmentError
  } = useSpecificAssessment(assessmentId);

  // Log detailed information about the specific assessment if applicable
  useEffect(() => {
    if (assessmentId) {
      console.log("Results page - Loading specific assessment:", assessmentId);
      console.log("Results page - Loading status:", loadingSpecificAssessment);
      
      // Safely log specific assessment data
      const safeSpecificData = specificAssessmentData ? {
        ...specificAssessmentData,
        categories: specificAssessmentData.categories ? 
          JSON.parse(JSON.stringify(specificAssessmentData.categories)) : null
      } : null;
      
      console.log("Results page - Specific assessment data:", safeSpecificData);
      console.log("Results page - Error:", specificAssessmentError);
    }
  }, [assessmentId, loadingSpecificAssessment, specificAssessmentData, specificAssessmentError]);

  // Use our updated hook to handle assessment data
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
  
  // Log the data that will be displayed in the results
  useEffect(() => {
    console.log("Results page - Display categories count:", displayCategories?.length || 0);
    console.log("Results page - Is assessment data valid:", isAssessmentDataValid);
    console.log("Results page - Is assessment data loading:", isAssessmentDataLoading);
    
    // Log detailed assessment debug data
    if (debugData) {
      console.log("Results page - Assessment debug data:", debugData);
    }
    
    // Detailed validation of display categories
    if (displayCategories && displayCategories.length > 0) {
      // Count ratings
      const ratingStats = {
        totalCategories: displayCategories.length,
        categoriesWithSkills: 0,
        totalSkills: 0,
        skillsWithCurrentRating: 0,
        skillsWithDesiredRating: 0,
        skillsWithBothRatings: 0
      };
      
      displayCategories.forEach(category => {
        if (category.skills && category.skills.length > 0) {
          ratingStats.categoriesWithSkills++;
          ratingStats.totalSkills += category.skills.length;
          
          category.skills.forEach(skill => {
            const hasCurrentRating = typeof skill.ratings?.current === 'number' && 
                                    !isNaN(skill.ratings.current) && 
                                    skill.ratings.current > 0;
                                    
            const hasDesiredRating = typeof skill.ratings?.desired === 'number' && 
                                    !isNaN(skill.ratings.desired) && 
                                    skill.ratings.desired > 0;
                                    
            if (hasCurrentRating) ratingStats.skillsWithCurrentRating++;
            if (hasDesiredRating) ratingStats.skillsWithDesiredRating++;
            if (hasCurrentRating && hasDesiredRating) ratingStats.skillsWithBothRatings++;
          });
        }
      });
      
      console.log("Results page - Display categories validation:", ratingStats);
    }
  }, [displayCategories, isAssessmentDataValid, isAssessmentDataLoading, debugData]);

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
      
      console.log('Results page - Triggering assessment save');
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
            debugData={debugData}
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


import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { saveAssessmentResults } from '@/services/assessment/saveAssessment';
import { storeLocalAssessmentData, getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useAuthForm } from './useAuthForm';
import { useSaveTracker } from './useSaveTracker';
import { usePreviousResults } from './usePreviousResults';

export const useResultsManagement = (
  categories: Category[],
  demographics: Demographics,
  setCategories: (categories: Category[]) => void,
  setDemographics: (demographics: Demographics) => void,
  setCurrentStep: (step: any) => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  // Log categories data for debugging
  useEffect(() => {
    console.log("useResultsManagement - Categories updated:", 
      categories ? JSON.stringify({ length: categories.length, isArray: Array.isArray(categories) }) : "none");
    
    if (categories && categories.length > 0) {
      // Count skills with ratings
      let skillsWithRatings = 0;
      categories.forEach(category => {
        if (category && category.skills) {
          category.skills.forEach(skill => {
            if (skill && skill.ratings && 
               (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) ||
               (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)) {
              skillsWithRatings++;
            }
          });
        }
      });
      console.log(`useResultsManagement - Categories contain ${skillsWithRatings} skills with ratings`);
    }
  }, [categories]);
  
  // Use our smaller, focused hooks
  const { 
    showAuthForm, 
    setShowAuthForm, 
    handleCloseAuthForm, 
    handleShowSignupForm 
  } = useAuthForm();
  
  const {
    isSaved,
    lastSavedDate,
    currentAssessmentId,
    markAsSaved,
    resetSaveState
  } = useSaveTracker();
  
  const {
    loadingPreviousResults,
    handleLoadPreviousResults
  } = usePreviousResults(setCategories, setDemographics, setCurrentStep);

  // Reset the saved flag when categories or demographics change
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Only reset if we have actual categories with data
      const hasRatings = categories.some(cat => 
        cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && (
            typeof skill.ratings.current === 'number' && skill.ratings.current > 0 || 
            typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0
          )
        )
      );
      
      if (hasRatings) {
        console.log('Categories/demographics changed with ratings, resetting saved flag');
        resetSaveState();
      }
    }
  }, [categories, demographics, resetSaveState]);

  // CRITICAL FIX: Always store assessment data locally when completing the assessment
  useEffect(() => {
    if (categories && categories.length > 0) {
      const hasRatings = categories.some(cat => 
        cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && (
            typeof skill.ratings.current === 'number' && skill.ratings.current > 0 || 
            typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0
          )
        )
      );
      
      if (hasRatings) {
        console.log('useResultsManagement - Storing assessment data locally');
        storeLocalAssessmentData(categories, demographics);
      }
    }
  }, [categories, demographics]);

  // Results save function
  const handleSaveResults = async () => {
    // Prevent multiple simultaneous save operations
    if (isSaving) {
      console.log('Already saving results, skipping duplicate call');
      return;
    }
    
    // Skip save if already saved in this session
    if (isSaved) {
      console.log('Results already saved in this session, skipping');
      return;
    }

    // If user isn't authenticated, check for local data anyway
    if (!user) {
      console.log('User not authenticated, showing auth form');
      
      // CRITICAL FIX: Load data from local storage if available
      const localData = getLocalAssessmentData();
      if (localData && (!categories || categories.length === 0)) {
        console.log('Found local assessment data, using that');
        setCategories(localData.categories);
        if (localData.demographics) {
          setDemographics(localData.demographics);
        }
      }
      
      setShowAuthForm(true);
      
      // Add toast to inform the user about data persistence
      toast({
        title: "Sign up to save your results",
        description: "Create an account to access your assessment history anytime.",
      });
      
      return;
    }
    
    // CRITICAL FIX: Try to get local data if categories is empty
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      const localData = getLocalAssessmentData();
      if (localData) {
        console.log('handleSaveResults - Retrieving categories from local storage');
        setCategories(localData.categories);
        if (localData.demographics) {
          setDemographics(localData.demographics);
        }
        
        // Wait a bit for state to update before continuing
        setTimeout(() => handleSaveResults(), 200);
        return;
      }
    }
    
    // Log the categories we're about to save
    console.log("handleSaveResults - Starting save with categories:", 
      categories ? JSON.stringify({ 
        length: categories.length, 
        isArray: Array.isArray(categories),
        firstCategory: categories.length > 0 ? categories[0].title : 'none'
      }) : "none");
    
    // Check for valid data before saving
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error('No valid categories to save, skipping');
      toast({
        title: "Error saving results",
        description: "No valid assessment data to save.",
        variant: "destructive",
      });
      return;
    }
    
    // Count skills with ratings to validate
    let skillsWithRatings = 0;
    categories.forEach(category => {
      if (category && category.skills) {
        category.skills.forEach(skill => {
          if (skill && skill.ratings && 
             (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) ||
             (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)) {
            skillsWithRatings++;
          }
        });
      }
    });
    
    if (skillsWithRatings === 0) {
      console.error('No skills with ratings found, skipping save');
      toast({
        title: "Error saving results",
        description: "No valid assessment ratings to save.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`handleSaveResults - Found ${skillsWithRatings} skills with ratings, proceeding with save`);
    
    setIsSaving(true);
    
    try {
      // Check if we already saved an assessment today
      const today = new Date().toISOString().split('T')[0];
      if (lastSavedDate === today) {
        console.log('Already saved an assessment today, updating instead of creating a new one');
      }
      
      const result = await saveAssessmentResults(categories, demographics);
      
      if (result.success) {
        // Log success details
        console.log('Successfully saved assessment results:', result);
        
        // Mark as saved for this session - safely handling the data property
        if (result.success && 'data' in result && result.data && result.data.length > 0) {
          const assessmentId = result.data[0].id;
          console.log('Saved assessment with ID:', assessmentId);
          markAsSaved(assessmentId, today);
        } else {
          // Still mark as saved but without an assessment ID
          console.log('Assessment saved but no ID returned');
          markAsSaved(undefined, today);
        }
        
        toast({
          title: "Results saved",
          description: "Your assessment results have been saved to your account.",
        });
      } else {
        console.error('Error saving results:', result.error);
        toast({
          title: "Error saving results",
          description: result.error || "An error occurred while saving your results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleSaveResults:", error);
      toast({
        title: "Error saving results",
        description: "An unexpected error occurred while saving your results.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      console.log('Assessment save operation completed');
    }
  };
  
  return {
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm,
    currentAssessmentId
  };
};

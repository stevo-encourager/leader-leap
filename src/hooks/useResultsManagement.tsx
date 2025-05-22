
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { saveAssessmentResults } from '@/services/assessment/saveAssessment';
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
        cat.skills && cat.skills.some(skill => 
          skill.ratings && (
            typeof skill.ratings.current === 'number' || 
            typeof skill.ratings.desired === 'number'
          )
        )
      );
      
      if (hasRatings) {
        console.log('Categories/demographics changed, resetting saved flag');
        resetSaveState();
      }
    }
  }, [categories, demographics, resetSaveState]);

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

    if (!user) {
      console.log('User not authenticated, showing auth form');
      setShowAuthForm(true);
      return;
    }
    
    // Check for valid data before saving
    const hasValidData = categories && categories.length > 0 && 
      categories.some(cat => 
        cat.skills && cat.skills.some(skill => 
          skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number'
        )
      );
    
    if (!hasValidData) {
      console.log('No valid assessment data to save, skipping');
      return;
    }
    
    setIsSaving(true);
    console.log('Starting assessment save operation');
    
    try {
      // Check if we already saved an assessment today
      const today = new Date().toISOString().split('T')[0];
      if (lastSavedDate === today) {
        console.log('Already saved an assessment today, updating instead of creating a new one');
      }
      
      console.log("Saving assessment results with categories:", categories);
      
      const result = await saveAssessmentResults(categories, demographics);
      
      if (result.success) {
        // Mark as saved for this session
        // Fix: Check if data exists and has at least one item before accessing it
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

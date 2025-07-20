
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AssessmentCategory } from '@/types/assessment';
import { storeLocalAssessmentData, getLocalAssessmentData, saveAssessmentResults, TEST_ASSESSMENT_ID } from '@/services/assessment';

interface UseResultsManagementProps {
  categories: AssessmentCategory[];
  demographics: any;
  onCategoriesUpdate?: (categories: AssessmentCategory[]) => void;
  onDemographicsUpdate?: (demographics: any) => void;
}

export const useResultsManagement = ({ 
  categories, 
  demographics, 
  onCategoriesUpdate, 
  onDemographicsUpdate 
}: UseResultsManagementProps) => {
  const { user, initialized } = useAuth();
  const [hasValidRatings, setHasValidRatings] = useState(false);
  const [savedToSupabase, setSavedToSupabase] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | undefined>();

  // Only check for ratings when auth is initialized
  useEffect(() => {
    if (!initialized) return;
    
    console.log('useResultsManagement - Categories updated:', {
      length: categories.length,
      isArray: Array.isArray(categories)
    });
    
    const checkRatings = () => {
      if (!Array.isArray(categories) || categories.length === 0) {
        setHasValidRatings(false);
        return;
      }
      
      const skillsWithRatings = categories.flatMap(category => 
        category.skills.filter(skill => 
          skill.ratings && 
          skill.ratings.current !== undefined && 
          skill.ratings.desired !== undefined
        )
      );
      
      console.log('useResultsManagement - Categories contain', skillsWithRatings.length, 'skills with ratings', 
        `(${skillsWithRatings.length * 2} total rating values)`);
      
      setHasValidRatings(skillsWithRatings.length > 0);
    };
    
    checkRatings();
  }, [categories, initialized]);

  // Reset saved flag when categories or demographics change (but only after auth is initialized)
  useEffect(() => {
    if (!initialized) return;
    
    if (hasValidRatings || demographics) {
      console.log('Categories/demographics changed with ratings, resetting saved flag');
      setSavedToSupabase(false);
      
      // Store locally when we have valid data
      console.log('useResultsManagement - Storing assessment data locally');
      storeLocalAssessmentData(categories, demographics);
    }
  }, [categories, demographics, hasValidRatings, initialized]);

  const updateCategories = useCallback((newCategories: AssessmentCategory[]) => {
    if (onCategoriesUpdate) {
      onCategoriesUpdate(newCategories);
    }
  }, [onCategoriesUpdate]);

  const updateDemographics = useCallback((newDemographics: any) => {
    if (onDemographicsUpdate) {
      onDemographicsUpdate(newDemographics);
    }
  }, [onDemographicsUpdate]);

  const markAsSaved = useCallback(() => {
    setSavedToSupabase(true);
  }, []);

  const handleSaveResults = useCallback(async () => {
    if (!user) {
      console.log('useResultsManagement - No user, skipping save to Supabase');
      return;
    }
    if (!hasValidRatings) {
      console.log('useResultsManagement - No valid ratings, skipping save');
      return;
    }
    if (savedToSupabase) {
      console.log('useResultsManagement - Already saved, skipping duplicate save');
      return;
    }
    
    // Additional validation: check if we actually have valid ratings
    const hasValidRatingsData = categories.some(cat => 
      cat && cat.skills && cat.skills.some(skill => 
        skill && skill.ratings && 
        Number(skill.ratings.current) > 0 && 
        Number(skill.ratings.desired) > 0
      )
    );
    
    if (!hasValidRatingsData) {
      console.log('useResultsManagement - Double-check failed: no valid ratings found');
      return;
    }
    try {
      let result;
      if (currentAssessmentId === TEST_ASSESSMENT_ID) {
        // Update the test assessment
        result = await saveAssessmentResults(categories, demographics, false, TEST_ASSESSMENT_ID);
      } else {
        // Always create a new record for normal assessments
        result = await saveAssessmentResults(categories, demographics);
      }
      if (result.success && result.data && result.data[0]?.id) {
        setCurrentAssessmentId(result.data[0].id);
        setSavedToSupabase(true);
        console.log('useResultsManagement - Assessment saved successfully:', result.data[0].id);
        // Optionally show a toast here
      } else {
        console.error('useResultsManagement - Failed to save assessment:', result.error);
        // Optionally show a toast here
      }
    } catch (error) {
      console.error('useResultsManagement - Error saving assessment:', error);
      // Optionally show a toast here
    }
  }, [user, hasValidRatings, savedToSupabase, categories, demographics, currentAssessmentId]);

  const handleLoadPreviousResults = useCallback(() => {
    console.log('useResultsManagement - handleLoadPreviousResults called');
    setLoadingPreviousResults(true);
    // TODO: Implement load previous results logic
    setTimeout(() => setLoadingPreviousResults(false), 1000); // Mock loading
  }, []);

  const handleCloseAuthForm = useCallback(() => {
    setShowAuthForm(false);
  }, []);

  const handleShowSignupForm = useCallback(() => {
    setShowAuthForm(true);
  }, []);

  return {
    categories,
    demographics,
    hasValidRatings,
    savedToSupabase,
    updateCategories,
    updateDemographics,
    markAsSaved,
    user,
    initialized,
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm,
    currentAssessmentId
  };
};

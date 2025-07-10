
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AssessmentCategory } from '@/types/assessment';
import { storeLocalAssessmentData, getLocalAssessmentData } from '@/services/assessment';

export const useResultsManagement = () => {
  const { user, initialized } = useAuth();
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [demographics, setDemographics] = useState<any>(null);
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
    setCategories(newCategories);
  }, []);

  const updateDemographics = useCallback((newDemographics: any) => {
    setDemographics(newDemographics);
  }, []);

  const markAsSaved = useCallback(() => {
    setSavedToSupabase(true);
  }, []);

  const handleSaveResults = useCallback(() => {
    console.log('useResultsManagement - handleSaveResults called');
    // TODO: Implement save results logic
  }, []);

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

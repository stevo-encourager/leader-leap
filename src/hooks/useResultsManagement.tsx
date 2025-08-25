
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AssessmentCategory } from '@/types/assessment';
import { storeLocalAssessmentData, getLocalAssessmentData, saveAssessmentResults, TEST_ASSESSMENT_ID } from '@/services/assessment';
import { assessmentLogger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/productionLogger';

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
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Only check for ratings when auth is initialized
  useEffect(() => {
    if (!initialized) return;
    

    
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
      

      
      setHasValidRatings(skillsWithRatings.length > 0);
    };
    
    checkRatings();
  }, [categories, initialized]);

            // Store data locally when categories or demographics change
          useEffect(() => {
            if (!initialized) return;
            
            if (hasValidRatings) {
              setSavedToSupabase(false);
              
              // Check if demographics are empty but exist in localStorage
              if ((!demographics || Object.keys(demographics).length === 0) && categories && categories.length > 0) {
                const localData = getLocalAssessmentData();
                if (localData && localData.demographics && Object.keys(localData.demographics).length > 0) {
                  // Don't overwrite with empty demographics if they exist in localStorage
                  return;
                }
              }
              
              // Store locally when we have valid data
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
      // For guest users, just store locally and don't attempt database save
      storeLocalAssessmentData(categories, demographics);
      return;
    }
    if (!hasValidRatings) {
      return;
    }
    if (savedToSupabase) {
      return;
    }
    if (isSaving) {
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
      return;
    }
    
    setIsSaving(true);
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
        

        
        toast({
          title: "Assessment Saved",
          description: "Your assessment results have been saved successfully.",
        });
      } else {
        logger.error('useResultsManagement - Failed to save assessment:', result.error);
        
        // Check if it's a session expiry error
        if (result.error?.includes('session has expired') || result.error?.includes('re-authenticate')) {
          toast({
            title: "Session Expired",
            description: "Please sign out and sign back in to save your results.",
            variant: "destructive",
            duration: 8000,
          });
          
          // Show the auth form to let user re-authenticate
          setShowAuthForm(true);
        } else {
          toast({
            title: "Save Failed",
            description: result.error || "Failed to save assessment results. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      logger.error('useResultsManagement - Error saving assessment:', error);
      
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, hasValidRatings, savedToSupabase, isSaving, categories, demographics, currentAssessmentId]);

  const handleLoadPreviousResults = useCallback(() => {
    setLoadingPreviousResults(true);
    // NOTE: Load previous results functionality deferred pending assessment history refactor
    // This will be implemented when the assessment history management is unified
    setTimeout(() => setLoadingPreviousResults(false), 1000); // Temporary mock
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

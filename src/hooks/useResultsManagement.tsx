
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { saveAssessmentResults, getLatestAssessmentResults } from '@/services/assessmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useResultsManagement = (
  categories: Category[],
  demographics: Demographics,
  setCategories: (categories: Category[]) => void,
  setDemographics: (demographics: Demographics) => void,
  setCurrentStep: (step: any) => void
) => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Add a flag to track if results have been saved in the current session
  // This prevents multiple saves when viewing the results page multiple times
  const resultsSavedRef = useRef(false);
  
  // Track the last save time to prevent rapid repeated saves
  const lastSaveTimeRef = useRef<number | null>(null);
  const SAVE_COOLDOWN_MS = 5000; // 5 seconds cooldown between saves
  
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
        resultsSavedRef.current = false;
      }
    }
  }, [categories, demographics]);

  // Results management functions
  const handleSaveResults = async () => {
    // Skip save if already saved in this session
    if (resultsSavedRef.current) {
      console.log('Results already saved in this session, skipping');
      return;
    }
    
    // Check if we're within the cooldown period
    const now = Date.now();
    if (lastSaveTimeRef.current && (now - lastSaveTimeRef.current < SAVE_COOLDOWN_MS)) {
      console.log(`Save attempted too soon (within ${SAVE_COOLDOWN_MS}ms cooldown), skipping`);
      return;
    }
    
    // Update the last save time
    lastSaveTimeRef.current = now;

    if (!user) {
      setShowAuthForm(true);
      return;
    }
    
    console.log("Saving assessment results with categories:", categories);
    
    const result = await saveAssessmentResults(categories, demographics);
    
    if (result.success) {
      // Mark as saved for this session
      resultsSavedRef.current = true;
      
      toast({
        title: "Results saved",
        description: "Your assessment results have been saved to your account.",
      });
    } else {
      toast({
        title: "Error saving results",
        description: result.error || "An error occurred while saving your results.",
        variant: "destructive",
      });
    }
  };
  
  const handleLoadPreviousResults = async () => {
    setLoadingPreviousResults(true);
    
    try {
      const result = await getLatestAssessmentResults();
      
      if (result.success && result.data) {
        const categoriesData = result.data.categories as unknown as Category[];
        const demographicsData = result.data.demographics as unknown as Demographics;
        
        setCategories(categoriesData);
        setDemographics(demographicsData || {});
        setCurrentStep('results');
        navigate('/results');
        
        toast({
          title: "Previous results loaded",
          description: "Your most recent assessment results have been loaded.",
        });
        
        // Since we loaded existing results, mark them as already saved
        resultsSavedRef.current = true;
      } else {
        toast({
          title: "No previous results found",
          description: "You don't have any saved assessment results yet.",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading results",
        description: "An error occurred while loading your previous results.",
        variant: "destructive",
      });
    } finally {
      setLoadingPreviousResults(false);
    }
  };
  
  const handleCloseAuthForm = useCallback(() => {
    setShowAuthForm(false);
  }, []);

  const handleShowSignupForm = useCallback(() => {
    setShowAuthForm(true);
  }, []);

  return {
    showAuthForm,
    loadingPreviousResults,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm
  };
};

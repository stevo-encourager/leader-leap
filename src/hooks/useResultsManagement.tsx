
import { useState, useCallback, useRef } from 'react';
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

  // Results management functions
  const handleSaveResults = async () => {
    // Skip save if already saved in this session
    if (resultsSavedRef.current) {
      console.log('Results already saved in this session, skipping');
      return;
    }

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

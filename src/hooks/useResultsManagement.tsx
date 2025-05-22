
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
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Store the assessment ID in a ref to track which assessment we're currently viewing
  const currentAssessmentIdRef = useRef<string | null>(null);
  
  // Add a flag to track if results have been saved in the current session
  // This prevents multiple saves when viewing the results page multiple times
  const resultsSavedRef = useRef(false);
  
  // Add a tracker to store the date when we last saved an assessment
  const lastSavedDateRef = useRef<string | null>(null);
  
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
    // Prevent multiple simultaneous save operations
    if (isSaving) {
      console.log('Already saving results, skipping duplicate call');
      return;
    }
    
    // Skip save if already saved in this session
    if (resultsSavedRef.current) {
      console.log('Results already saved in this session, skipping');
      return;
    }

    if (!user) {
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
    
    try {
      // Check if we already saved an assessment today
      const today = new Date().toISOString().split('T')[0];
      if (lastSavedDateRef.current === today) {
        console.log('Already saved an assessment today, updating instead of creating a new one');
      }
      
      console.log("Saving assessment results with categories:", categories);
      
      const result = await saveAssessmentResults(categories, demographics);
      
      if (result.success) {
        // Mark as saved for this session
        resultsSavedRef.current = true;
        
        // Store today's date as the last saved date
        lastSavedDateRef.current = today;
        
        // Store the assessment ID to track which assessment we're viewing
        if (result.data && result.data.length > 0) {
          currentAssessmentIdRef.current = result.data[0].id;
          console.log('Saved assessment with ID:', currentAssessmentIdRef.current);
        }
        
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
    } catch (error) {
      console.error("Error in handleSaveResults:", error);
      toast({
        title: "Error saving results",
        description: "An unexpected error occurred while saving your results.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        
        // Store the assessment ID
        if (result.data.id) {
          currentAssessmentIdRef.current = result.data.id;
          console.log('Loaded assessment with ID:', currentAssessmentIdRef.current);
          
          // Also set the last saved date
          if (result.data.created_at) {
            lastSavedDateRef.current = new Date(result.data.created_at).toISOString().split('T')[0];
          }
        }
        
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
    handleShowSignupForm,
    currentAssessmentId: currentAssessmentIdRef.current
  };
};

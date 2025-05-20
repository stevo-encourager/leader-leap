
import { useState, useEffect } from 'react';
import { AssessmentStep, Category, Demographics } from '../utils/assessmentData';
import { saveAssessmentResults, getLatestAssessmentResults } from '@/services/assessmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAssessment = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // When user logs in, check if they have previous results
    if (user && currentStep === 'results') {
      handleSaveResults();
    }
  }, [user, currentStep]);

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  const handleDemographicsUpdate = (updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
  };

  const handleStartAssessment = () => {
    setCurrentStep('demographics');
  };

  const handleContinueToAssessment = () => {
    setCurrentStep('assessment');
  };

  const handleBackToIntro = () => {
    setCurrentStep('intro');
  };

  const handleBackToDemographics = () => {
    setCurrentStep('demographics');
  };

  const handleCompleteAssessment = () => {
    setCurrentStep('results');
    
    // If user is logged in, save results automatically
    if (user) {
      handleSaveResults();
    }
  };
  
  const handleSaveResults = async () => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }
    
    const result = await saveAssessmentResults(categories, demographics);
    
    if (result.success) {
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
        // Convert the JSON data to the expected type
        const categoriesData = result.data.categories as unknown as Category[];
        const demographicsData = result.data.demographics as unknown as Demographics;
        
        setCategories(categoriesData);
        setDemographics(demographicsData || {});
        setCurrentStep('results');
        
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
  
  const handleCloseAuthForm = () => {
    setShowAuthForm(false);
  };

  const handleShowSignupForm = () => {
    setShowAuthForm(true);
  };

  return {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    loadingPreviousResults,
    handleCategoriesUpdate,
    handleDemographicsUpdate,
    handleStartAssessment,
    handleContinueToAssessment,
    handleBackToIntro,
    handleBackToDemographics,
    handleCompleteAssessment,
    handleSaveResults,
    handleLoadPreviousResults,
    handleCloseAuthForm,
    handleShowSignupForm
  };
};

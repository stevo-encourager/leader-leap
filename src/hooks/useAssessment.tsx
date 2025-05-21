
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
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
    console.log("Setting state to demographics and navigating to assessment");
    setCurrentStep('demographics');
    navigate('/assessment');
  };

  const handleContinueToAssessment = () => {
    console.log("Setting state to assessment");
    setCurrentStep('assessment');
  };

  const handleBackToIntro = () => {
    console.log("Setting state to intro and navigating to home");
    setCurrentStep('intro');
    navigate('/');
  };

  const handleBackToDemographics = () => {
    console.log("Setting state to demographics");
    setCurrentStep('demographics');
  };

  const handleCompleteAssessment = () => {
    console.log("Setting state to results and navigating to results");
    setCurrentStep('results');
    navigate('/results');
    
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

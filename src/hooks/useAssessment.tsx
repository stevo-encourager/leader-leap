
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AssessmentStep, Category, Demographics, initialCategories } from '../utils/assessmentData';
import { saveAssessmentResults, getLatestAssessmentResults } from '@/services/assessmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAssessment = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Log categories whenever they change
  useEffect(() => {
    console.log("useAssessment hook - current categories:", categories);
  }, [categories]);

  // Update the current step based on the route when component mounts
  useEffect(() => {
    if (location.pathname === '/') {
      setCurrentStep('intro');
    } else if (location.pathname === '/assessment') {
      setCurrentStep(prevStep => prevStep === 'intro' ? 'demographics' : prevStep);
    } else if (location.pathname === '/results') {
      setCurrentStep('results');
      
      // Initialize with dummy data for testing if categories are empty
      if (!categories || (categories.length > 0 && categories[0].skills.length > 0 && 
          !categories[0].skills[0].ratings)) {
        console.log("Initializing categories with test data for results page");
        const testCategories = JSON.parse(JSON.stringify(initialCategories));
        
        // Add some random ratings to each skill
        testCategories.forEach((category: Category) => {
          category.skills.forEach((skill) => {
            skill.ratings = {
              current: Math.floor(Math.random() * 8) + 1,
              desired: Math.floor(Math.random() * 3) + 7
            };
          });
        });
        
        setCategories(testCategories);
      }
    }
  }, [location.pathname, categories]);

  // Effect to handle result saving when user logs in
  useEffect(() => {
    if (user && currentStep === 'results') {
      handleSaveResults();
    }
  }, [user, currentStep]);

  // Basic data management functions
  const handleCategoriesUpdate = useCallback((updatedCategories: Category[]) => {
    console.log("Updating categories:", updatedCategories);
    setCategories(updatedCategories);
  }, []);

  const handleDemographicsUpdate = useCallback((updatedDemographics: Demographics) => {
    setDemographics(updatedDemographics);
  }, []);

  // Navigation functions - simplified to align with React Router
  const handleStartAssessment = useCallback(() => {
    setCurrentStep('demographics');
    navigate('/assessment');
  }, [navigate]);

  const handleContinueToAssessment = useCallback(() => {
    setCurrentStep('assessment');
  }, []);

  const handleBackToIntro = useCallback(() => {
    setCurrentStep('intro');
    navigate('/');
  }, [navigate]);

  const handleBackToDemographics = useCallback(() => {
    setCurrentStep('demographics');
  }, []);

  const handleCompleteAssessment = useCallback(() => {
    setCurrentStep('results');
    navigate('/results');
    
    if (user) {
      handleSaveResults();
    }
  }, [navigate, user]);
  
  // Results management functions
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
  
  const handleCloseAuthForm = useCallback(() => {
    setShowAuthForm(false);
  }, []);

  const handleShowSignupForm = useCallback(() => {
    setShowAuthForm(true);
  }, []);

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

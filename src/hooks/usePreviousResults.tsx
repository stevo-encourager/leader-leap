
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { getLatestAssessmentResults } from '@/services/assessment/fetchAssessment';
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { toast } from '@/hooks/use-toast';
import { useSaveTracker } from './useSaveTracker';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage loading previous assessment results
 */
export const usePreviousResults = (
  setCategories: (categories: Category[]) => void,
  setDemographics: (demographics: Demographics) => void,
  setCurrentStep: (step: any) => void
) => {
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const navigate = useNavigate();
  const { markAsSaved } = useSaveTracker();
  const { user } = useAuth();
  
  // Helper function to validate and process categories data
  const validateAndProcessCategories = (categoriesData: any): Category[] | null => {
    if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
      return null;
    }
    
    // Process and validate each category
    const processedCategories = categoriesData.map(category => {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        return null;
      }
      
      // Process skills and ensure ratings are numeric
      const processedSkills = category.skills.map(skill => {
        if (!skill || !skill.ratings) {
          return null;
        }
        
        const current = Number(skill.ratings.current) || 0;
        const desired = Number(skill.ratings.desired) || 0;
        
        return {
          ...skill,
          ratings: {
            current,
            desired
          }
        };
      }).filter(Boolean);
      
      return {
        ...category,
        skills: processedSkills
      };
    }).filter(Boolean);
    
    // Validate that we have actual rating data
    let totalRatings = 0;
    processedCategories.forEach(category => {
      category.skills.forEach(skill => {
        if (skill.ratings.current > 0) totalRatings++;
        if (skill.ratings.desired > 0) totalRatings++;
      });
    });
    
    if (totalRatings === 0) {
      return null;
    }
    
    return processedCategories;
  };
  
  const handleLoadPreviousResults = async () => {
    setLoadingPreviousResults(true);
    
    try {
      // If user is not authenticated, try to load from local storage instead
      if (!user) {
        const localData = getLocalAssessmentData();
        
        if (localData && localData.categories) {
          const validatedCategories = validateAndProcessCategories(localData.categories);
          
          if (validatedCategories) {
            setCategories(validatedCategories);
            setDemographics(localData.demographics || {});
            setCurrentStep('results');
            
            navigate('/results');
            
            toast({
              title: "Local results loaded",
              description: "Create an account to save your results permanently.",
            });
          } else {
            toast({
              title: "No valid assessment data",
              description: "Your saved data doesn't contain complete assessment ratings.",
            });
          }
        } else {
          toast({
            title: "No previous results found",
            description: "You don't have any saved assessment results yet.",
          });
        }
        
        setLoadingPreviousResults(false);
        return;
      }
      
      // User is authenticated, try to load from database
      const result = await getLatestAssessmentResults(user.id);
      
      if (result.success && result.data) {
        const categoriesData = result.data.categories;
        const demographicsData = result.data.demographics;
        
        // Validate and process the categories
        const validatedCategories = validateAndProcessCategories(categoriesData);
        
        if (validatedCategories) {
          setCategories(validatedCategories);
          setDemographics(demographicsData || {});
          setCurrentStep('results');
          
          // Store the assessment ID and mark as saved
          if (result.data.id) {
            if (result.data.created_at) {
              const savedDate = new Date(result.data.created_at).toISOString().split('T')[0];
              markAsSaved(result.data.id, savedDate);
            } else {
              markAsSaved(result.data.id);
            }
          }
          
          navigate('/results');
          
          toast({
            title: "Previous results loaded",
            description: "Your most recent assessment results have been loaded.",
          });
        } else {
          toast({
            title: "No valid assessment data",
            description: "Your saved assessment doesn't contain complete ratings. Please complete a new assessment.",
          });
        }
      } else {
        toast({
          title: "No previous results found",
          description: "You don't have any saved assessment results yet. Please complete the assessment.",
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
  
  return {
    loadingPreviousResults,
    handleLoadPreviousResults
  };
};


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
  
  const handleLoadPreviousResults = async () => {
    setLoadingPreviousResults(true);
    console.log('Loading previous results for user:', user?.id);
    
    try {
      // If user is not authenticated, try to load from local storage instead
      if (!user) {
        const localData = getLocalAssessmentData();
        
        if (localData && localData.categories && Array.isArray(localData.categories) && localData.categories.length > 0) {
          console.log('No user authenticated, loading from local storage:', 
            JSON.stringify({
              categoriesCount: localData.categories.length,
              timestamp: localData.timestamp || 'unknown'
            }));
          
          setCategories(localData.categories);
          setDemographics(localData.demographics || {});
          setCurrentStep('results');
          
          navigate('/results');
          
          toast({
            title: "Local results loaded",
            description: "Create an account to save your results permanently.",
          });
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
      console.log('User authenticated, fetching from database for user:', user.id);
      const result = await getLatestAssessmentResults();
      
      console.log('Database fetch result:', result);
      
      if (result.success && result.data) {
        // Validate that we have actual categories data with ratings
        const categoriesData = result.data.categories as unknown as Category[];
        const demographicsData = result.data.demographics as unknown as Demographics;
        
        let hasValidData = false;
        
        // Verify we have actual rating values in the categories
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          hasValidData = categoriesData.some(category => 
            category && category.skills && Array.isArray(category.skills) &&
            category.skills.some(skill => 
              skill && skill.ratings && 
              (typeof skill.ratings.current === 'number' && skill.ratings.current > 0 ||
               typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
            )
          );
          
          console.log('Results validation:', {
            categoriesCount: categoriesData.length, 
            hasValidData
          });
        }
        
        if (hasValidData) {
          // Process and type-check all ratings to ensure they're numbers
          const processedCategories = categoriesData.map(category => ({
            ...category,
            skills: category.skills.map(skill => ({
              ...skill,
              ratings: {
                current: typeof skill.ratings.current === 'number' ? skill.ratings.current : 0,
                desired: typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0
              }
            }))
          }));
          
          console.log('Setting processed categories with valid data');
          setCategories(processedCategories);
          setDemographics(demographicsData || {});
          setCurrentStep('results');
          
          // Store the assessment ID
          if (result.data.id) {
            console.log('Loaded assessment with ID:', result.data.id);
            
            // Mark as saved with the loaded assessment ID and date
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
          console.log('Database results had invalid/empty rating data, trying local storage fallback');
          // No valid ratings in database results, try local storage as fallback
          tryLoadFromLocalStorage();
        }
      } else {
        // No results in database, try local storage as fallback for authenticated users
        console.log('No database results found, trying local storage fallback');
        tryLoadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading previous results:', error);
      toast({
        title: "Error loading results",
        description: "An error occurred while loading your previous results.",
        variant: "destructive",
      });
      tryLoadFromLocalStorage();
    } finally {
      setLoadingPreviousResults(false);
    }
  };
  
  // Helper function to attempt loading from local storage
  const tryLoadFromLocalStorage = () => {
    const localData = getLocalAssessmentData();
    
    if (localData && localData.categories && Array.isArray(localData.categories) && localData.categories.length > 0) {
      // Validate that we have actual rating values in the local data
      const hasValidLocalData = localData.categories.some(category => 
        category && category.skills && Array.isArray(category.skills) &&
        category.skills.some(skill => 
          skill && skill.ratings && 
          (typeof skill.ratings.current === 'number' && skill.ratings.current > 0 ||
           typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
        )
      );
      
      if (hasValidLocalData) {
        console.log('Found valid local assessment data, using that as fallback');
        
        // Process and type-check all ratings to ensure they're numbers
        const processedCategories = localData.categories.map(category => ({
          ...category,
          skills: category.skills.map(skill => ({
            ...skill,
            ratings: {
              current: typeof skill.ratings.current === 'number' ? skill.ratings.current : 0,
              desired: typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0
            }
          }))
        }));
        
        setCategories(processedCategories);
        setDemographics(localData.demographics || {});
        setCurrentStep('results');
        
        navigate('/results');
        
        toast({
          title: "Local results loaded",
          description: user 
            ? "These results haven't been saved to your account yet. Complete the assessment again while logged in to save them."
            : "Create an account to save your results permanently.",
        });
        
        return true;
      }
    }
    
    console.log('No valid local assessment data found');
    toast({
      title: "No previous results found",
      description: "You don't have any saved assessment results yet. Please complete the assessment.",
    });
    
    return false;
  };
  
  return {
    loadingPreviousResults,
    handleLoadPreviousResults
  };
};

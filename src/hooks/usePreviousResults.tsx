
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
      const result = await getLatestAssessmentResults();
      
      if (result.success && result.data) {
        const categoriesData = result.data.categories as unknown as Category[];
        const demographicsData = result.data.demographics as unknown as Demographics;
        
        setCategories(categoriesData);
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
        // No results in database, try local storage as fallback for authenticated users
        const localData = getLocalAssessmentData();
        
        if (localData && localData.categories && Array.isArray(localData.categories) && localData.categories.length > 0) {
          console.log('No database results found, loading from local storage as fallback');
          
          setCategories(localData.categories);
          setDemographics(localData.demographics || {});
          setCurrentStep('results');
          
          navigate('/results');
          
          toast({
            title: "Local results loaded",
            description: "These results haven't been saved to your account yet. Complete the assessment again while logged in to save them.",
          });
        } else {
          toast({
            title: "No previous results found",
            description: "You don't have any saved assessment results yet.",
          });
        }
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

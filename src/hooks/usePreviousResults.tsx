
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { getLatestAssessmentResults } from '@/services/assessment/fetchAssessment';
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { toast } from '@/hooks/use-toast';
import { useSaveTracker } from './useSaveTracker';
import { useAuth } from '@/contexts/AuthContext';
import { saveAssessmentResults } from '@/services/assessment/saveAssessment';

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
  
  // Helper function to migrate local data to the database
  const migrateLocalDataToDB = async () => {
    try {
      const localData = getLocalAssessmentData();
      
      if (!localData || !localData.categories || !localData.categories.length) {
        console.log('No local data to migrate');
        return false;
      }
      
      console.log('Attempting to migrate local data during load:', {
        categoriesCount: localData.categories.length,
        firstCategory: localData.categories[0]?.title || 'none'
      });
      
      // Let's attempt to migrate the data before trying to load
      const result = await saveAssessmentResults(localData.categories, localData.demographics || {});
      
      if (result.success) {
        console.log('Successfully migrated local data during load attempt:', result);
        toast({
          title: "Data migrated",
          description: "Your local assessment data has been saved to your account.",
        });
        return true;
      } else {
        console.error('Failed to migrate local data during load:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error during migration attempt:', error);
      return false;
    }
  };
  
  const handleLoadPreviousResults = async () => {
    setLoadingPreviousResults(true);
    
    try {
      // If user is authenticated, try to load from database first
      if (user) {
        console.log('User is authenticated, attempting to load from database');
        
        const result = await getLatestAssessmentResults();
        
        if (result.success && result.data) {
          console.log('Successfully loaded results from database:', {
            id: result.data.id,
            timestamp: result.data.created_at,
            categoriesCount: result.data.categories?.length || 0
          });
          
          const categoriesData = result.data.categories as unknown as Category[];
          const demographicsData = result.data.demographics as unknown as Demographics;
          
          // Check if we actually have valid data with ratings
          const hasRatings = categoriesData && categoriesData.some(cat => 
            cat && cat.skills && cat.skills.some(skill => 
              skill && skill.ratings && (
                (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
                (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
              )
            )
          );
          
          if (hasRatings) {
            console.log('Database results contain valid ratings, proceeding with data');
            
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
            
            setLoadingPreviousResults(false);
            return;
          } else {
            console.log('Database results exist but contain no ratings, checking local storage as fallback');
          }
        } else {
          console.log('No database results found or error occurred, checking if local data needs migration');
          
          // Try to migrate local data to database if it exists and user is authenticated
          const migrationSuccessful = await migrateLocalDataToDB();
          
          if (migrationSuccessful) {
            // If migration was successful, try loading from database again
            console.log('Migration successful, retrying database load');
            const retryResult = await getLatestAssessmentResults();
            
            if (retryResult.success && retryResult.data) {
              console.log('Successfully loaded results after migration:', {
                id: retryResult.data.id,
                categoriesCount: retryResult.data.categories?.length || 0
              });
              
              const categoriesData = retryResult.data.categories as unknown as Category[];
              const demographicsData = retryResult.data.demographics as unknown as Demographics;
              
              setCategories(categoriesData);
              setDemographics(demographicsData || {});
              setCurrentStep('results');
              
              if (retryResult.data.id) {
                if (retryResult.data.created_at) {
                  const savedDate = new Date(retryResult.data.created_at).toISOString().split('T')[0];
                  markAsSaved(retryResult.data.id, savedDate);
                } else {
                  markAsSaved(retryResult.data.id);
                }
              }
              
              navigate('/results');
              
              toast({
                title: "Results loaded",
                description: "Your assessment results have been loaded from your account.",
              });
              
              setLoadingPreviousResults(false);
              return;
            }
          }
        }
      }
      
      // If we get here, either:
      // 1. User is not authenticated, or
      // 2. No database results found, or 
      // 3. Migration failed
      // So try to load from local storage instead
      
      const localData = getLocalAssessmentData();
      
      if (localData && localData.categories && localData.categories.length > 0) {
        console.log('Loading from local storage:', {
          categoriesCount: localData.categories.length,
          timestamp: localData.timestamp || 'unknown'
        });
        
        // Check if we have any valid ratings in the local data
        const hasRatings = localData.categories.some(cat => 
          cat && cat.skills && cat.skills.some(skill => 
            skill && skill.ratings && (
              (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
              (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
            )
          )
        );
        
        if (hasRatings) {
          console.log('Local data contains valid ratings');
          
          // Debug the first category's ratings
          if (localData.categories.length > 0 && localData.categories[0].skills.length > 0) {
            console.log('Sample local data rating:', {
              category: localData.categories[0].title,
              skill: localData.categories[0].skills[0].name,
              ratings: localData.categories[0].skills[0].ratings
            });
          }
          
          setCategories(localData.categories);
          setDemographics(localData.demographics || {});
          setCurrentStep('results');
          
          navigate('/results');
          
          if (user) {
            toast({
              title: "Local results loaded",
              description: "We found local results but couldn't find any in your account. We'll try to save these to your account.",
            });
            
            // Attempt to save these results to the user's account
            migrateLocalDataToDB();
          } else {
            toast({
              title: "Local results loaded",
              description: "Create an account to save your results permanently.",
            });
          }
        } else {
          console.warn('Local data exists but contains no valid ratings');
          toast({
            title: "No valid results found",
            description: "Your saved assessment has no ratings data. Please complete the assessment again.",
          });
        }
      } else {
        console.log('No local data found either');
        toast({
          title: "No previous results found",
          description: "You don't have any saved assessment results yet.",
        });
      }
    } catch (error) {
      console.error("Error loading previous results:", error);
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

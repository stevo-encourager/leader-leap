
import { toast } from './use-toast';
import { storeLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { Category, Demographics } from '@/utils/assessmentTypes';

export const useAssessmentCompletion = (
  categories: Category[],
  demographics: Demographics,
  completeHandler: () => void
) => {
  const handleCompleteAssessment = () => {
    console.log("handleCompleteAssessment - Completing assessment with categories:", 
                categories ? JSON.stringify({ length: categories.length, isArray: Array.isArray(categories) }) : "none");
    
    // Check if we have valid category data before completing
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error("handleCompleteAssessment - Cannot complete: categories is empty or invalid");
      toast({
        title: "Error completing assessment",
        description: "Assessment data is missing or invalid. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Count skills with ratings
    let skillsWithRatings = 0;
    categories.forEach(category => {
      if (category && category.skills) {
        category.skills.forEach(skill => {
          if (skill && skill.ratings && 
             (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) ||
             (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)) {
            skillsWithRatings++;
          }
        });
      }
    });
    
    if (skillsWithRatings === 0) {
      console.warn("handleCompleteAssessment - No skills with ratings found");
    }
    
    // CRITICAL FIX: Store assessment data locally before changing page
    storeLocalAssessmentData(categories, demographics);
    console.log("handleCompleteAssessment - Stored assessment data locally");
    
    // Call the original handler
    completeHandler();
  };

  return {
    handleCompleteAssessment
  };
};


import { toast } from './use-toast';
import { storeLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { saveAssessmentResults } from '@/services/assessment/saveAssessment';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useAuth } from '@/contexts/AuthContext';

export const useAssessmentCompletion = (
  categories: Category[],
  demographics: Demographics,
  completeHandler: () => void,
  onShowSignupForm?: () => void
) => {
  const { user } = useAuth();
  const handleCompleteAssessment = async () => {
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
    // Count skills with ratings to ensure the assessment is complete
    let totalSkills = 0;
    let skillsWithBothRatings = 0;
    categories.forEach((category, catIndex) => {
      if (category && category.skills) {
        category.skills.forEach((skill, skillIndex) => {
          totalSkills++;
          const hasValidRatings = skill && skill.ratings && 
             (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) &&
             (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0);
          if (hasValidRatings) {
            skillsWithBothRatings++;
          }
        });
      }
    });
    // Check if all skills have been rated
    if (skillsWithBothRatings < totalSkills) {
      console.warn(`handleCompleteAssessment - Incomplete assessment: ${skillsWithBothRatings}/${totalSkills} skills rated`);
      toast({
        title: "Incomplete Assessment",
        description: `Please complete all ratings (${skillsWithBothRatings} of ${totalSkills} completed).`,
        variant: "destructive",
      });
      return;
    }
    // CRITICAL FIX: Save assessment to Supabase immediately (with temp user ID if not logged in)
    const saveResult = await saveAssessmentResults(categories, demographics);
    console.log('useAssessmentCompletion - Save to Supabase result:', saveResult);
    // Check if user is logged in
    if (user) {
      completeHandler();
    } else {
      if (onShowSignupForm) {
        onShowSignupForm();
      } else {
        // Fallback to original handler
        completeHandler();
      }
    }
  };
  return {
    handleCompleteAssessment
  };
};

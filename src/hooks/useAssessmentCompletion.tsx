
import { toast } from './use-toast';
import { storeLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { Category, Demographics } from '@/utils/assessmentTypes';

export const useAssessmentCompletion = (
  categories: Category[],
  demographics: Demographics,
  completeHandler: () => void
) => {
  const handleCompleteAssessment = () => {
    console.log('handleCompleteAssessment called', { 
      categoriesCount: categories?.length,
      demographicsPresent: !!demographics 
    });
    
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
          } else {
            console.log(`Skill missing ratings:`, {
              categoryIndex: catIndex,
              categoryTitle: category.title,
              skillIndex,
              skillName: skill?.name,
              currentRating: skill?.ratings?.current,
              desiredRating: skill?.ratings?.desired
            });
          }
        });
      }
    });
    
    console.log('Skills rating validation:', {
      totalSkills,
      skillsWithBothRatings,
      completionPercentage: Math.round((skillsWithBothRatings / totalSkills) * 100)
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
    
    console.log('Assessment completion validation passed');
    
    // CRITICAL FIX: Store assessment data locally before changing page
    console.log('Storing assessment data locally');
    storeLocalAssessmentData(categories, demographics);
    
    console.log('Calling completeHandler');
    // Call the original handler
    completeHandler();
  };

  return {
    handleCompleteAssessment
  };
};

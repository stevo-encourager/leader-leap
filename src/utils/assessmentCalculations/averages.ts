
import { Category } from '../assessmentTypes';

// Calculate average gap across all skills
export const calculateAverageGap = (categories: Category[]): number => {
  // Return early if no valid data
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return 0;
  }
  
  let totalValidSkills = 0;
  let totalGapValue = 0;
  
  for (const category of categories) {
    if (!category.skills || !Array.isArray(category.skills)) continue;
    
    for (const skill of category.skills) {
      // Skip skills without valid ratings
      if (!skill.ratings) continue;
      
      // Convert ratings to numbers and ensure they're valid
      const current = Number(skill.ratings.current) || 0;
      const desired = Number(skill.ratings.desired) || 0;
      
      // Only count skills where at least one rating has a value
      if (current > 0 || desired > 0) {
        const gap = Math.abs(desired - current);
        totalGapValue += gap;
        totalValidSkills++;
      }
    }
  }
  
  // Avoid division by zero
  if (totalValidSkills === 0) return 0;
  
  // Return the average gap with 2 decimal places
  return parseFloat((totalGapValue / totalValidSkills).toFixed(2));
};


import { Category } from '../assessmentTypes';

// Simple function to calculate the average gap
export const calculateAverageGap = (categories: Category[]): number => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    return 0;
  }
  
  if (categories.length === 0) {
    return 0;
  }
  
  let totalGap = 0;
  let totalSkillsWithRatings = 0;
  
  // Process each category and its skills
  for (const category of categories) {
    // Skip undefined categories
    if (!category) {
      continue;
    }
    
    // Handle missing skills array
    if (!category.skills || !Array.isArray(category.skills)) {
      continue;
    }
    
    // Process skills in this category
    for (const skill of category.skills) {
      // Skip invalid skills or skills without ratings
      if (!skill || !skill.ratings) continue;
      
      // Ensure we have numerical values
      const current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : Number(skill.ratings.current || 0);
        
      const desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : Number(skill.ratings.desired || 0);
      
      // Only count skills with valid ratings (at least one rating > 0)
      if (current > 0 || desired > 0) {
        const gap = Math.abs(desired - current);
        totalGap += gap;
        totalSkillsWithRatings++;
      }
    }
  }
  
  // Calculate average (avoid division by zero)
  const average = totalSkillsWithRatings > 0 
    ? totalGap / totalSkillsWithRatings 
    : 0;
  
  // Return the result with 2 decimal places
  return Number(average.toFixed(2));
};

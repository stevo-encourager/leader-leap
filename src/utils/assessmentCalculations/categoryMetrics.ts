
import { Category } from '../assessmentTypes';
import { CategoryWithMetadata } from './types';

// Calculate category-level gaps and metadata
export const getCategoriesWithMetadata = (categories: Category[]): CategoryWithMetadata[] => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return [];
  }
  
  return categories.map(category => {
    // Default values in case there are no valid skills
    let avgCurrent = 0;
    let avgDesired = 0;
    let gap = 0;
    
    if (category.skills && Array.isArray(category.skills) && category.skills.length > 0) {
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      for (const skill of category.skills) {
        if (!skill.ratings) continue;
        
        const current = Number(skill.ratings.current);
        const desired = Number(skill.ratings.desired);
        
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
        }
      }
      
      if (validSkillCount > 0) {
        avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(2));
        avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(2));
        gap = parseFloat(Math.abs(avgDesired - avgCurrent).toFixed(2));
      }
    }
    
    return {
      id: category.id,
      title: category.title,
      description: category.description,
      gap,
      averageRatings: { 
        current: avgCurrent, 
        desired: avgDesired 
      }
    };
  });
};

// Get categories with largest gaps
export const getLargestCategoryGaps = (categories: Category[], count: number = 3): CategoryWithMetadata[] => {
  const categoriesWithMetadata = getCategoriesWithMetadata(categories);
  
  if (categoriesWithMetadata.length === 0) return [];
  
  // Sort by gap (largest to smallest) and take requested count
  return [...categoriesWithMetadata]
    .filter(cat => cat.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count);
};

// Get categories with smallest gaps
export const getSmallestCategoryGaps = (categories: Category[], count: number = 3): CategoryWithMetadata[] => {
  const categoriesWithMetadata = getCategoriesWithMetadata(categories);
  
  if (categoriesWithMetadata.length === 0) return [];
  
  // Filter out categories with zero gap
  const nonZeroGapCategories = categoriesWithMetadata.filter(category => category.gap > 0);
  
  // If there are no categories with gaps, return empty array
  if (nonZeroGapCategories.length === 0) return [];
  
  // Sort by gap (smallest to largest) and take requested count
  return [...nonZeroGapCategories]
    .sort((a, b) => a.gap - b.gap)
    .slice(0, count);
};

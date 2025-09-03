
import { Category } from '../assessmentTypes';
import { CategoryWithMetadata } from './types';
import { logger } from './productionLogger';

// Calculate category-level gaps and metadata
export const getCategoriesWithMetadata = (categories: Category[]): CategoryWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    logger.error("getCategoriesWithMetadata received invalid categories:", categories);
    return [];
  }
  
  if (categories.length === 0) {
    return [];
  }
  
  return categories.map(category => {
    // Skip undefined category objects
    if (!category) {
      return {
        id: `category-${Math.random().toString(36).substring(2, 9)}`,
        title: "Unknown Category",
        description: "",
        gap: 0,
        averageRatings: { current: 0, desired: 0 }
      };
    }
    
    // Default values in case there are no valid skills
    let avgCurrent = 0;
    let avgDesired = 0;
    let gap = 0;
    
    if (category.skills && Array.isArray(category.skills) && category.skills.length > 0) {
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      for (const skill of category.skills) {
        if (!skill || !skill.ratings) continue;
        
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
      id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
      title: category.title || "Unknown Category",
      description: category.description || "",
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
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    logger.error("getLargestCategoryGaps received invalid categories:", categories);
    return [];
  }
  
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
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    logger.error("getSmallestCategoryGaps received invalid categories:", categories);
    return [];
  }
  
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

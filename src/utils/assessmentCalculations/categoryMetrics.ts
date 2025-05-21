
import { Category } from '../assessmentTypes';
import { CategoryWithMetadata } from './types';

// Calculate category-level gaps and metadata
export const getCategoriesWithMetadata = (categories: Category[]): CategoryWithMetadata[] => {
  try {
    if (!categories || categories.length === 0) return [];
    
    return categories.map(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
        return {
          id: category.id,
          title: category.title,
          description: category.description,
          gap: 0,
          averageRatings: { current: 0, desired: 0 }
        };
      }
      
      let totalCurrentRating = 0;
      let totalDesiredRating = 0;
      let validSkillCount = 0;
      
      category.skills.forEach(skill => {
        if (skill.ratings) {
          const current = typeof skill.ratings.current === 'number' ? skill.ratings.current : parseFloat(String(skill.ratings.current || '0'));
          const desired = typeof skill.ratings.desired === 'number' ? skill.ratings.desired : parseFloat(String(skill.ratings.desired || '0'));
          
          totalCurrentRating += current;
          totalDesiredRating += desired;
          validSkillCount++;
        }
      });
      
      if (validSkillCount === 0) validSkillCount = 1; // Prevent division by zero
      
      const avgCurrent = parseFloat((totalCurrentRating / validSkillCount).toFixed(2));
      const avgDesired = parseFloat((totalDesiredRating / validSkillCount).toFixed(2));
      const gap = parseFloat((Math.abs(avgDesired - avgCurrent)).toFixed(2));
      
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
  } catch (error) {
    console.error("Error in getCategoriesWithMetadata:", error);
    return [];
  }
};

// Get categories with largest gaps
export const getLargestCategoryGaps = (categories: Category[], count: number = 3): CategoryWithMetadata[] => {
  try {
    const categoriesWithMetadata = getCategoriesWithMetadata(categories);
    if (categoriesWithMetadata.length === 0) return [];
    
    return [...categoriesWithMetadata]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getLargestCategoryGaps:", error);
    return [];
  }
};

// Get categories with smallest gaps
export const getSmallestCategoryGaps = (categories: Category[], count: number = 3): CategoryWithMetadata[] => {
  try {
    const categoriesWithMetadata = getCategoriesWithMetadata(categories);
    if (categoriesWithMetadata.length === 0) return [];
    
    // Filter out categories with zero gap to avoid showing meaningless results
    const nonZeroGapCategories = categoriesWithMetadata.filter(category => category.gap > 0);
    
    return [...nonZeroGapCategories]
      .sort((a, b) => a.gap - b.gap)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSmallestCategoryGaps:", error);
    return [];
  }
};

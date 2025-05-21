
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
      
      // Log for debugging
      console.log(`Processing category: ${category.title} with ${category.skills.length} skills`);
      
      category.skills.forEach(skill => {
        if (skill.ratings) {
          // Get direct values without modifications
          let current = typeof skill.ratings.current === 'number' ? skill.ratings.current : 0;
          let desired = typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0;
          
          // Only count skills with valid ratings
          if (current > 0 || desired > 0) {
            // Ensure values are within range without modifying original values
            if (current === 0) current = 1;
            if (desired === 0) desired = Math.min(current + 2, 10);
            
            current = Math.max(1, Math.min(10, current));
            desired = Math.max(1, Math.min(10, desired));
            
            console.log(`  Skill: ${skill.name}, Current: ${current}, Desired: ${desired}`);
            
            totalCurrentRating += current;
            totalDesiredRating += desired;
            validSkillCount++;
          }
        }
      });
      
      if (validSkillCount === 0) {
        console.log(`No valid skills in category: ${category.title}`);
        return {
          id: category.id,
          title: category.title,
          description: category.description,
          gap: 0,
          averageRatings: { current: 0, desired: 0 }
        };
      }
      
      const avgCurrent = parseFloat((totalCurrentRating / validSkillCount).toFixed(2));
      const avgDesired = parseFloat((totalDesiredRating / validSkillCount).toFixed(2));
      
      // Calculate the absolute gap
      const gap = parseFloat(Math.abs(avgDesired - avgCurrent).toFixed(2));
      
      console.log(`Category ${category.title}: Avg Current: ${avgCurrent}, Avg Desired: ${avgDesired}, Gap: ${gap}`);
      
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


import { Category } from '../assessmentTypes';
import { CategoryWithMetadata } from './types';

// Calculate category-level gaps and metadata
export const getCategoriesWithMetadata = (categories: Category[]): CategoryWithMetadata[] => {
  try {
    console.log(`CATEGORY_METRICS - Processing ${categories?.length || 0} categories`);
    
    if (!categories || categories.length === 0) return [];
    
    return categories.map(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
        console.log(`CATEGORY_METRICS - Category ${category.title} has no skills`);
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
      
      console.log(`CATEGORY_METRICS - Category: ${category.title} with ${category.skills.length} skills`);
      
      // Log the first skill for debugging
      if (category.skills.length > 0) {
        const firstSkill = category.skills[0];
        console.log(`CATEGORY_METRICS - First skill example: ${firstSkill.name}, Ratings:`, firstSkill.ratings);
      }
      
      category.skills.forEach(skill => {
        // Get actual rating values directly
        const current = typeof skill.ratings?.current === 'number' ? skill.ratings.current : 0;
        const desired = typeof skill.ratings?.desired === 'number' ? skill.ratings.desired : 0;
        
        // Only include skills with at least one rating
        if (current > 0 || desired > 0) {
          console.log(`CATEGORY_METRICS - Valid skill: ${skill.name}, Current: ${current}, Desired: ${desired}`);
          totalCurrentRating += current;
          totalDesiredRating += desired;
          validSkillCount++;
        } else {
          console.log(`CATEGORY_METRICS - Skipping skill with no ratings: ${skill.name}`);
        }
      });
      
      if (validSkillCount === 0) {
        console.log(`CATEGORY_METRICS - No valid skills in category: ${category.title}`);
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
      
      // Calculate the gap as absolute difference
      const gap = parseFloat(Math.abs(avgDesired - avgCurrent).toFixed(2));
      
      console.log(`CATEGORY_METRICS - Category ${category.title}: Avg Current: ${avgCurrent}, Avg Desired: ${avgDesired}, Gap: ${gap}`);
      
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
    console.error("CATEGORY_METRICS - Error in getCategoriesWithMetadata:", error);
    return [];
  }
};

// Get categories with largest gaps
export const getLargestCategoryGaps = (categories: Category[], count: number = 3): CategoryWithMetadata[] => {
  try {
    const categoriesWithMetadata = getCategoriesWithMetadata(categories);
    console.log(`CATEGORY_METRICS - getLargestCategoryGaps: Generated ${categoriesWithMetadata.length} categories with metadata`);
    
    if (categoriesWithMetadata.length === 0) return [];
    
    // Log each category's gap before sorting
    categoriesWithMetadata.forEach(cat => {
      console.log(`CATEGORY_METRICS - Before sort: ${cat.title}, Gap: ${cat.gap}`);
    });
    
    const sorted = [...categoriesWithMetadata].sort((a, b) => b.gap - a.gap);
    
    // Log top results
    console.log(`CATEGORY_METRICS - Top ${count} gaps after sorting:`);
    sorted.slice(0, count).forEach(cat => {
      console.log(`CATEGORY_METRICS - ${cat.title}: Gap ${cat.gap}, Current: ${cat.averageRatings.current}, Desired: ${cat.averageRatings.desired}`);
    });
    
    return sorted.slice(0, count);
  } catch (error) {
    console.error("CATEGORY_METRICS - Error in getLargestCategoryGaps:", error);
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
    
    const sorted = [...nonZeroGapCategories].sort((a, b) => a.gap - b.gap);
    
    return sorted.slice(0, count);
  } catch (error) {
    console.error("CATEGORY_METRICS - Error in getSmallestCategoryGaps:", error);
    return [];
  }
};

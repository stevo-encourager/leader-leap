
import { Category } from '../assessmentTypes';
import { CategoryWithMetadata } from './types';

// Calculate category-level gaps and metadata
export const getCategoriesWithMetadata = (categories: Category[]): CategoryWithMetadata[] => {
  try {
    if (!categories || categories.length === 0) return [];
    
    console.log(`getCategoriesWithMetadata - Processing ${categories.length} categories`);
    
    return categories.map(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
        console.log(`Category ${category.title} has no skills`);
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
      
      console.log(`Processing category: ${category.title} with ${category.skills.length} skills`);
      
      // For debugging, output all skill ratings
      category.skills.forEach(skill => {
        console.log(`  Skill: ${skill.name}, Ratings:`, skill.ratings);
      });
      
      category.skills.forEach(skill => {
        // Get actual rating values directly
        const current = Number(skill.ratings?.current) || 0;
        const desired = Number(skill.ratings?.desired) || 0;
        
        // Only count skills with valid ratings
        if (current > 0 && desired > 0) {
          console.log(`  Valid skill: ${skill.name}, Current: ${current}, Desired: ${desired}`);
          
          totalCurrentRating += current;
          totalDesiredRating += desired;
          validSkillCount++;
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
      
      // Calculate the gap as absolute difference
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
    
    console.log("getLargestCategoryGaps - Category gaps before sorting:", 
      categoriesWithMetadata.map(c => ({ title: c.title, gap: c.gap })));
    
    const sorted = [...categoriesWithMetadata].sort((a, b) => b.gap - a.gap);
    
    console.log("getLargestCategoryGaps - Top gaps after sorting:", 
      sorted.slice(0, count).map(c => ({ title: c.title, gap: c.gap })));
    
    return sorted.slice(0, count);
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
    
    console.log("getSmallestCategoryGaps - Category gaps before sorting:", 
      nonZeroGapCategories.map(c => ({ title: c.title, gap: c.gap })));
    
    const sorted = [...nonZeroGapCategories].sort((a, b) => a.gap - b.gap);
    
    console.log("getSmallestCategoryGaps - Bottom gaps after sorting:", 
      sorted.slice(0, count).map(c => ({ title: c.title, gap: c.gap })));
    
    return sorted.slice(0, count);
  } catch (error) {
    console.error("Error in getSmallestCategoryGaps:", error);
    return [];
  }
};

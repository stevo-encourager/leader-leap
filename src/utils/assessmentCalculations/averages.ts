
import { Category } from '../assessmentTypes';

// Calculate average gap across all skills
export const calculateAverageGap = (categories: Category[]): number => {
  try {
    console.log("AVERAGES - Starting calculateAverageGap with", categories.length, "categories");
    console.log("AVERAGES - First category sample:", categories[0]?.title);
    
    if (!categories || categories.length === 0) {
      console.warn("No categories provided to calculateAverageGap");
      return 0;
    }
    
    let totalSkillCount = 0;
    let totalGapValue = 0;
    
    // Debug log for incoming data structure
    categories.forEach((cat, idx) => {
      console.log(`AVERAGES - Category ${idx}: ${cat.title} with ${cat.skills?.length || 0} skills`);
      if (cat.skills && cat.skills.length > 0) {
        console.log(`AVERAGES - First skill in ${cat.title}:`, JSON.stringify(cat.skills[0]));
      }
    });
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
        console.log(`AVERAGES - Skipping category ${category.title} - no skills`);
        return;
      }
      
      category.skills.forEach(skill => {
        // Get ratings directly, ensuring they're treated as numbers
        const current = Number(skill.ratings?.current);
        const desired = Number(skill.ratings?.desired);
        
        // Only calculate gap for skills with valid ratings (greater than 0)
        if (current > 0 || desired > 0) {
          const gap = Math.abs(desired - current);
          
          console.log(`AVERAGES - Valid skill found: ${skill.name}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
          
          totalSkillCount++;
          totalGapValue += gap;
        } else {
          console.log(`AVERAGES - Skipping skill ${skill.name} with invalid ratings: current=${current}, desired=${desired}`);
        }
      });
    });
    
    if (totalSkillCount === 0) {
      console.warn("AVERAGES - No valid skills found for average gap calculation");
      return 0;
    }
    
    // Calculate the average gap
    const calculatedGap = parseFloat((totalGapValue / totalSkillCount).toFixed(2));
    console.log(`AVERAGES - Final calculation: Average gap ${calculatedGap} from ${totalSkillCount} skills with total gap value ${totalGapValue}`);
    
    return calculatedGap;
  } catch (error) {
    console.error("Error in calculateAverageGap:", error);
    return 0;
  }
};


import { Category } from '../assessmentTypes';

// Calculate average gap across all skills
export const calculateAverageGap = (categories: Category[]): number => {
  try {
    console.log("AVERAGES - Starting calculateAverageGap with", categories.length, "categories");
    
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
        cat.skills.forEach((skill, i) => {
          console.log(`AVERAGES - Skill ${i} in ${cat.title}: ${skill.name}, Ratings:`, 
                      JSON.stringify(skill.ratings));
        });
      }
    });
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
        console.log(`AVERAGES - Skipping category ${category.title} - no skills`);
        return;
      }
      
      category.skills.forEach(skill => {
        // Get ratings directly, ensuring they're treated as numbers
        const current = typeof skill.ratings?.current === 'number' ? skill.ratings.current : 0;
        const desired = typeof skill.ratings?.desired === 'number' ? skill.ratings.desired : 0;
        
        // Calculate gap only for skills with valid ratings
        if (current > 0 || desired > 0) {
          const gap = Math.abs(desired - current);
          
          console.log(`AVERAGES - Processing: ${skill.name}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
          
          totalSkillCount++;
          totalGapValue += gap;
        } else {
          console.log(`AVERAGES - Skipping skill ${skill.name} with invalid ratings`);
        }
      });
    });
    
    if (totalSkillCount === 0) {
      console.warn("AVERAGES - No valid skills found for average gap calculation");
      return 0;
    }
    
    // Calculate the average gap
    const calculatedGap = parseFloat((totalGapValue / totalSkillCount).toFixed(2));
    console.log(`AVERAGES - Final: Average gap ${calculatedGap} from ${totalSkillCount} skills with total gap value ${totalGapValue}`);
    
    return calculatedGap;
  } catch (error) {
    console.error("Error in calculateAverageGap:", error);
    return 0;
  }
};

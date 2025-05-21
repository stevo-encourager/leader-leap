
import { Category } from '../assessmentTypes';

// Calculate average gap across all skills
export const calculateAverageGap = (categories: Category[]): number => {
  try {
    if (!categories || categories.length === 0) {
      console.warn("No categories provided to calculateAverageGap");
      return 0; // Return 0 when no data is available
    }
    
    let totalSkillCount = 0;
    let totalGapValue = 0;
    
    // Log categories for debugging
    console.log("calculateAverageGap - Input categories:", JSON.stringify(categories.map(c => ({
      title: c.title,
      skillCount: c.skills?.length || 0
    }))));
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) return;
      
      category.skills.forEach(skill => {
        // Get ratings, ensuring they are numbers
        const current = Number(skill.ratings?.current);
        const desired = Number(skill.ratings?.desired);
        
        // Only calculate gap for skills with both ratings defined
        if (!isNaN(current) && !isNaN(desired)) {
          // Calculate absolute gap
          const gap = Math.abs(desired - current);
          
          console.log(`Skill: ${skill.name}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
          
          // Only count skills with at least one non-zero rating
          if (current > 0 || desired > 0) {
            totalSkillCount++;
            totalGapValue += gap;
          }
        }
      });
    });
    
    if (totalSkillCount === 0) {
      console.warn("No valid skills found for average gap calculation");
      return 0;
    }
    
    // Calculate the average gap
    const calculatedGap = parseFloat((totalGapValue / totalSkillCount).toFixed(2));
    console.log("Calculated average gap:", calculatedGap, 
                "from", totalSkillCount, "skills with total gap value:", totalGapValue);
    
    return calculatedGap;
  } catch (error) {
    console.error("Error in calculateAverageGap:", error);
    return 0;
  }
};

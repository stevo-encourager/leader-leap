
import { Category } from '../assessmentTypes';
import { normalizeSkill } from './normalizers';

// Calculate average gap across all skills
export const calculateAverageGap = (categories: Category[]): number => {
  try {
    if (!categories || categories.length === 0) {
      console.warn("No categories provided to calculateAverageGap");
      return 0; // Return 0 when no data is available
    }
    
    let totalSkillCount = 0;
    let totalGapValue = 0;
    
    // Log categories to help with debugging
    console.log("calculateAverageGap - Input categories:", JSON.stringify(categories.map(c => ({
      title: c.title,
      skillCount: c.skills?.length || 0
    }))));
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) return;
      
      category.skills.forEach(skill => {
        // Get original ratings directly without normalization
        const current = typeof skill.ratings?.current === 'number' ? skill.ratings.current : 0;
        const desired = typeof skill.ratings?.desired === 'number' ? skill.ratings.desired : 0;
        
        // Only count skills with valid ratings
        if (current > 0 && desired > 0) {
          // Calculate gap directly as absolute difference
          const gap = Math.abs(desired - current);
          
          console.log(`Skill: ${skill.name}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
          
          totalSkillCount++;
          totalGapValue += gap;
        }
      });
    });
    
    if (totalSkillCount === 0) {
      console.warn("No valid skills found for average gap calculation");
      return 0;
    }
    
    // Calculate the actual average gap
    const calculatedGap = parseFloat((totalGapValue / totalSkillCount).toFixed(2));
    console.log("Calculated average gap:", calculatedGap, 
                "from", totalSkillCount, "skills with total gap value:", totalGapValue);
    
    return calculatedGap;
  } catch (error) {
    console.error("Error in calculateAverageGap:", error);
    return 0;
  }
};

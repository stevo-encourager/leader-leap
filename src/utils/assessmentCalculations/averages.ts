
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
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) return;
      
      category.skills.forEach(skill => {
        const normalizedSkill = normalizeSkill(skill, category.title);
        
        if (normalizedSkill) {
          totalSkillCount++;
          totalGapValue += normalizedSkill.gap;
        }
      });
    });
    
    if (totalSkillCount === 0) return 0; // Return 0 when no skills are found
    
    // Calculate the actual average gap
    const calculatedGap = parseFloat((totalGapValue / totalSkillCount).toFixed(2));
    console.log("Calculated average gap:", calculatedGap, "from", totalSkillCount, "skills with total gap value:", totalGapValue);
    
    return calculatedGap;
  } catch (error) {
    console.error("Error in calculateAverageGap:", error);
    return 0;
  }
};

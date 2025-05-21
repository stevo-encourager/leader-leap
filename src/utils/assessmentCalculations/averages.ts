
import { Category } from '../assessmentTypes';
import { normalizeSkill } from './normalizers';

// Calculate average gap across all skills
export const calculateAverageGap = (categories: Category[]): number => {
  try {
    if (!categories || categories.length === 0) {
      console.warn("No categories provided to calculateAverageGap");
      return 1; // Default to 1 instead of 0
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
    
    if (totalSkillCount === 0) return 1; // Default to 1 instead of 0
    
    // Ensure average gap is formatted to 2 decimal places
    const calculatedGap = parseFloat((totalGapValue / totalSkillCount).toFixed(2));
    console.log("Calculated average gap:", calculatedGap, "from", totalSkillCount, "skills with total gap value:", totalGapValue);
    
    return calculatedGap;
  } catch (error) {
    console.error("Error in calculateAverageGap:", error);
    return 1; // Default to 1 instead of 0
  }
};

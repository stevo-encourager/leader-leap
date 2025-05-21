
import { Category } from './assessmentTypes';

export interface SkillWithMetadata {
  id: string;
  name: string;
  categoryTitle: string;
  gap: number;
  ratings: {
    current: number;
    desired: number;
  };
}

// Helper function to normalize skill data with better error handling
const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  try {
    // Handle both name and competency fields
    const skillName = skill.name || skill.competency || 'Unknown Skill';
    
    // Ensure we have valid ratings and convert strings to numbers if needed
    let current = 0;
    let desired = 0;
    
    if (skill.ratings) {
      // Try to parse numeric values, default to 1 if the value is 0 to avoid all zeros
      current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current || 1 // Default to 1 if 0
        : parseFloat(String(skill.ratings.current || '1'));
        
      desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired || 2 // Default to 2 if 0, ensuring a gap exists
        : parseFloat(String(skill.ratings.desired || '2'));
    }
    
    // If both values are still 0 after parsing, set defaults
    if (current === 0) current = 1;
    if (desired === 0) desired = 2;
    
    // Ensure gap is formatted to 2 decimal places
    const gap = parseFloat((Math.abs(desired - current)).toFixed(2));
    
    return {
      id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
      name: skillName,
      categoryTitle,
      gap,
      ratings: { 
        current: parseFloat(current.toFixed(2)), 
        desired: parseFloat(desired.toFixed(2)) 
      }
    };
  } catch (error) {
    console.error(`Error normalizing skill:`, error, skill);
    return null;
  }
};

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

export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  try {
    if (!categories || categories.length === 0) return [];
    
    const result: SkillWithMetadata[] = [];
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills)) {
        return;
      }
      
      category.skills.forEach(skill => {
        const normalizedSkill = normalizeSkill(skill, category.title);
        if (normalizedSkill) {
          result.push(normalizedSkill);
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error("Error in getAllSkillsWithMetadata:", error);
    return [];
  }
};

export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    return [...allSkills]
      .sort((a, b) => b.ratings.current - a.ratings.current)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getTopStrengths:", error);
    return [];
  }
};

export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    return [...allSkills]
      .sort((a, b) => a.ratings.current - b.ratings.current)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getLowestSkills:", error);
    return [];
  }
};

export const getLargestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    return [...allSkills]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getLargestGaps:", error);
    return [];
  }
};

export const getSmallestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    // Filter out skills with zero gap to avoid showing meaningless results
    const nonZeroGapSkills = allSkills.filter(skill => skill.gap > 0);
    
    return [...nonZeroGapSkills]
      .sort((a, b) => a.gap - b.gap)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSmallestGaps:", error);
    return [];
  }
};

export const getSkillsToImprove = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    // Sort by desired rating (high to low) to find skills the user wants to focus on
    return [...allSkills]
      .sort((a, b) => b.ratings.desired - a.ratings.desired)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSkillsToImprove:", error);
    return [];
  }
};

export const getSkillsMeetingExpectations = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    // Sort by current rating (high to low) to find skills the user is already good at
    return [...allSkills]
      .sort((a, b) => b.ratings.current - a.ratings.current)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSkillsMeetingExpectations:", error);
    return [];
  }
};

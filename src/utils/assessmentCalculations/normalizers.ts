
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data with better error handling
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  try {
    // Handle both name and competency fields
    const skillName = skill.name || skill.competency || 'Unknown Skill';
    
    // Ensure we have valid ratings and convert strings to numbers if needed
    let current = 0;
    let desired = 0;
    
    if (skill.ratings) {
      // Try to parse numeric values, preserve actual values instead of defaulting to small numbers
      current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : parseFloat(String(skill.ratings.current || '1'));
        
      desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : parseFloat(String(skill.ratings.desired || '5'));
    }
    
    // If both values are still 0 after parsing, set defaults that show a reasonable gap
    if (current === 0) current = 1;
    if (desired === 0) desired = 5;
    
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

// Get all skills with metadata information
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

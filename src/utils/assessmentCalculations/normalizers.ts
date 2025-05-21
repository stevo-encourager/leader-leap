import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data while preserving original values
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  try {
    // Handle both name and competency fields
    const skillName = skill.name || skill.competency || 'Unknown Skill';
    
    // Get original ratings without manipulation - important to keep as numbers
    const current = Number(skill.ratings?.current);
    const desired = Number(skill.ratings?.desired);
    
    // Calculate gap as the absolute difference between desired and current
    // Only when both values are present (we don't apply defaults here)
    let gap = 0;
    if (!isNaN(current) && !isNaN(desired)) {
      gap = Math.abs(desired - current);
    }
    
    console.log(`Normalized Skill: ${skillName}, Category: ${categoryTitle}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
    
    return {
      id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
      name: skillName,
      categoryTitle,
      gap,
      ratings: { 
        current, 
        desired 
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
    
    console.log(`getAllSkillsWithMetadata - Processed ${result.length} skills`);
    
    return result;
  } catch (error) {
    console.error("Error in getAllSkillsWithMetadata:", error);
    return [];
  }
};

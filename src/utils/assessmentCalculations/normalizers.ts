
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data while preserving original values
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  try {
    // Handle both name and competency fields
    const skillName = skill.name || skill.competency || 'Unknown Skill';
    
    // Get original ratings without manipulation
    const originalCurrent = Number(skill.ratings?.current) || 0;
    const originalDesired = Number(skill.ratings?.desired) || 0;
    
    // Only use valid ratings (greater than 0)
    let current = originalCurrent;
    let desired = originalDesired;
    
    // Apply minimal defaults only if absolutely necessary
    if (current <= 0 && desired <= 0) {
      console.log(`Both ratings are invalid for skill ${skillName}, using default values`);
      current = 1;
      desired = 6;
    } else {
      // Fix individual invalid ratings if needed
      if (current <= 0) current = 1;
      if (desired <= 0) desired = current + 3;
    }
    
    // Calculate gap directly as difference between desired and current
    const gap = Math.abs(desired - current);
    
    console.log(`Normalized Skill: ${skillName}, Category: ${categoryTitle}, Current: ${current}, Desired: ${desired}, Gap: ${gap} (Original values: ${originalCurrent}, ${originalDesired})`);
    
    return {
      id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
      name: skillName,
      categoryTitle,
      gap,
      ratings: { 
        current: current, 
        desired: desired 
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

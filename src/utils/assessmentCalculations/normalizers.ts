
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data with better error handling
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  try {
    // Handle both name and competency fields
    const skillName = skill.name || skill.competency || 'Unknown Skill';
    
    // Direct parsing from the original values, preserving originals where possible
    let current = 0;
    let desired = 0;
    
    if (skill.ratings) {
      // Parse numeric values without modifying them
      current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : parseFloat(String(skill.ratings.current || '0'));
        
      desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : parseFloat(String(skill.ratings.desired || '0'));
    }
    
    // Only set default values if both are invalid
    if (current === 0 && desired === 0) {
      console.log(`Using defaults for skill ${skillName} as both ratings are 0`);
      current = 3;
      desired = 8;
    } else {
      // Clean up individual values if needed
      if (current === 0) current = 1;
      if (desired === 0) desired = Math.min(current + 2, 10);
    }
    
    // Ensure values are within 1-10 range
    current = Math.max(1, Math.min(10, current));
    desired = Math.max(1, Math.min(10, desired));
    
    // Calculate the gap as a simple difference between desired and current
    const gap = Math.abs(desired - current);
    
    console.log(`Normalized Skill: ${skillName}, Category: ${categoryTitle}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
    
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

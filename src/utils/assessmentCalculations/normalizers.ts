
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data while preserving original values
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  try {
    // Handle both name and competency fields
    const skillName = skill.name || skill.competency || 'Unknown Skill';
    
    // Get original ratings and properly convert to numbers
    const current = Number(skill.ratings?.current || 0);
    const desired = Number(skill.ratings?.desired || 0);
    
    // Log detailed information about the ratings for debugging
    console.log(`NORMALIZER - Processing skill: ${skillName}`);
    console.log(`NORMALIZER - Raw ratings:`, skill.ratings);
    console.log(`NORMALIZER - Current: ${skill.ratings?.current} (${typeof skill.ratings?.current}) → ${current}`);
    console.log(`NORMALIZER - Desired: ${skill.ratings?.desired} (${typeof skill.ratings?.desired}) → ${desired}`);
    
    // Calculate gap as absolute difference between desired and current
    const gap = Math.abs(desired - current);
    
    console.log(`NORMALIZER - Skill: ${skillName}, Category: ${categoryTitle}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
    
    // Skip skills with no ratings (both current and desired are 0)
    if (current === 0 && desired === 0) {
      console.log(`NORMALIZER - Skipping skill with no ratings: ${skillName}`);
      return null;
    }
    
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
    console.error(`NORMALIZER - Error normalizing skill:`, error, skill);
    return null;
  }
};

// Get all skills with metadata information
export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  try {
    console.log(`NORMALIZER - getAllSkillsWithMetadata starting with ${categories?.length || 0} categories`);
    
    if (!categories || categories.length === 0) return [];
    
    const result: SkillWithMetadata[] = [];
    
    // Log structure for debugging
    categories.forEach((cat, idx) => {
      console.log(`NORMALIZER - Category ${idx}: ${cat.title}`);
      if (cat.skills && cat.skills.length > 0) {
        console.log(`NORMALIZER - First skill in ${cat.title}:`, JSON.stringify(cat.skills[0]));
        console.log(`NORMALIZER - First skill ratings in ${cat.title}:`, cat.skills[0].ratings);
      }
    });
    
    categories.forEach(category => {
      if (!category.skills || !Array.isArray(category.skills)) {
        console.log(`NORMALIZER - Skipping category ${category.title} - no skills array`);
        return;
      }
      
      category.skills.forEach(skill => {
        const normalizedSkill = normalizeSkill(skill, category.title);
        if (normalizedSkill) {
          result.push(normalizedSkill);
        }
      });
    });
    
    console.log(`NORMALIZER - Processed ${result.length} skills with valid ratings`);
    if (result.length > 0) {
      console.log(`NORMALIZER - First processed skill:`, result[0]);
    }
    
    return result;
  } catch (error) {
    console.error("NORMALIZER - Error in getAllSkillsWithMetadata:", error);
    return [];
  }
};

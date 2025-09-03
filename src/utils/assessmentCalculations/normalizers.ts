
import { Category, Skill } from '../assessmentTypes';
import { SkillWithMetadata } from './types';
import { logger } from './productionLogger';

/**
 * Normalizes a skill with additional metadata
 */
export const normalizeSkill = (
  skill: Skill,
  categoryTitle: string
): SkillWithMetadata | null => {
  try {
    if (!skill || !skill.ratings) {
      return null;
    }
    
    // Parse ratings as numbers and provide safe defaults
    let current = 0;
    let desired = 0;
    
    // Handle current rating
    if (typeof skill.ratings.current === 'number') {
      current = isNaN(skill.ratings.current) ? 0 : skill.ratings.current;
    } else if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
      try {
        current = parseFloat(String(skill.ratings.current));
        current = isNaN(current) ? 0 : current;
      } catch (e) {
        // Skip invalid rating
      }
    }
    
    // Handle desired rating
    if (typeof skill.ratings.desired === 'number') {
      desired = isNaN(skill.ratings.desired) ? 0 : skill.ratings.desired;
    } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
      try {
        desired = parseFloat(String(skill.ratings.desired));
        desired = isNaN(desired) ? 0 : desired;
      } catch (e) {
        // Skip invalid rating
      }
    }
    
    // Check for valid numbers
    current = isNaN(current) ? 0 : current;
    desired = isNaN(desired) ? 0 : desired;
    
    // Only include skills with at least one non-zero value
    if (current === 0 && desired === 0) {
      return null;
    }
    
    // Calculate gap
    const gap = desired - current;
    
    return {
      id: skill.id,
      name: skill.name,
      categoryTitle,
      gap,
      ratings: {
        current,
        desired
      }
    };
  } catch (error) {
    logger.error("Error in normalizeSkill:", error);
    return null;
  }
};

/**
 * Retrieves all skills with metadata from categories
 */
export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  try {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    
    const allSkills: SkillWithMetadata[] = [];
    
    // Process each category
    for (const category of categories) {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        continue;
      }
      
      // Process each skill in the category
      for (const skill of category.skills) {
        const normalizedSkill = normalizeSkill(skill, category.title);
        
        if (normalizedSkill) {
          allSkills.push(normalizedSkill);
        }
      }
    }
    
    return allSkills;
  } catch (error) {
    logger.error("Error in getAllSkillsWithMetadata:", error);
    return [];
  }
};

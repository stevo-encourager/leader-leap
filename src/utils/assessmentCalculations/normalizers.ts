
import { Category, Skill } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

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
    
    const current = typeof skill.ratings.current === 'number' 
      ? skill.ratings.current 
      : Number(skill.ratings.current || 0);
      
    const desired = typeof skill.ratings.desired === 'number' 
      ? skill.ratings.desired 
      : Number(skill.ratings.desired || 0);
    
    // Check for valid numbers
    if (isNaN(current) || isNaN(desired)) {
      console.log(`normalizeSkill - Invalid rating values for ${skill.name}: current=${skill.ratings.current}, desired=${skill.ratings.desired}`);
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
    console.error("Error in normalizeSkill:", error);
    return null;
  }
};

/**
 * Retrieves all skills with metadata from categories
 */
export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  try {
    console.log("getAllSkillsWithMetadata - Processing categories:", categories?.length || 0);
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log("getAllSkillsWithMetadata - No categories");
      return [];
    }
    
    const allSkills: SkillWithMetadata[] = [];
    
    // Process each category
    for (const category of categories) {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        console.log(`getAllSkillsWithMetadata - Skipping invalid category: ${category?.title || 'unknown'}`);
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
    
    console.log(`getAllSkillsWithMetadata - Found ${allSkills.length} normalized skills`);
    return allSkills;
  } catch (error) {
    console.error("Error in getAllSkillsWithMetadata:", error);
    return [];
  }
};

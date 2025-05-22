
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
      console.log(`normalizeSkill - Skipping invalid skill (no ratings):`, skill);
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
        console.warn(`normalizeSkill - Error parsing current rating for ${skill.name}:`, e);
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
        console.warn(`normalizeSkill - Error parsing desired rating for ${skill.name}:`, e);
      }
    }
    
    // Check for valid numbers
    current = isNaN(current) ? 0 : current;
    desired = isNaN(desired) ? 0 : desired;
    
    // Only include skills with at least one non-zero value
    if (current === 0 && desired === 0) {
      console.log(`normalizeSkill - Skipping skill with zero ratings: ${skill.name}`);
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
    console.log("getAllSkillsWithMetadata - Processing categories:", {
      count: categories?.length || 0,
      isArray: Array.isArray(categories)
    });
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log("getAllSkillsWithMetadata - No categories");
      return [];
    }
    
    // For debugging, count initial ratings
    const initialRatingsCount = categories.reduce((total, category) => {
      if (!category || !category.skills || !Array.isArray(category.skills)) return total;
      
      return total + category.skills.reduce((skillTotal, skill) => {
        if (!skill || !skill.ratings) return skillTotal;
        
        const hasCurrentRating = typeof skill.ratings.current === 'number' && 
                                !isNaN(skill.ratings.current) && 
                                skill.ratings.current > 0;
        const hasDesiredRating = typeof skill.ratings.desired === 'number' && 
                                !isNaN(skill.ratings.desired) && 
                                skill.ratings.desired > 0;
        
        return skillTotal + (hasCurrentRating ? 1 : 0) + (hasDesiredRating ? 1 : 0);
      }, 0);
    }, 0);
    
    console.log(`getAllSkillsWithMetadata - Initial ratings count: ${initialRatingsCount}`);
    
    const allSkills: SkillWithMetadata[] = [];
    
    // Process each category
    for (const category of categories) {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        console.log(`getAllSkillsWithMetadata - Skipping invalid category: ${category?.title || 'unknown'}`);
        continue;
      }
      
      console.log(`getAllSkillsWithMetadata - Processing category: ${category.title} with ${category.skills.length} skills`);
      
      // Process each skill in the category
      for (const skill of category.skills) {
        const normalizedSkill = normalizeSkill(skill, category.title);
        
        if (normalizedSkill) {
          allSkills.push(normalizedSkill);
          console.log(`getAllSkillsWithMetadata - Added skill: ${skill.name}, current=${normalizedSkill.ratings.current}, desired=${normalizedSkill.ratings.desired}`);
        }
      }
    }
    
    console.log(`getAllSkillsWithMetadata - Found ${allSkills.length} normalized skills from ${initialRatingsCount} initial ratings`);
    return allSkills;
  } catch (error) {
    console.error("Error in getAllSkillsWithMetadata:", error);
    return [];
  }
};

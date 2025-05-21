
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  // Skip invalid skills
  if (!skill) return null;
  
  // Get skill name, falling back to alternatives if necessary
  const skillName = skill.name || skill.competency || 'Unknown Skill';
  
  // Ensure ratings exist with fallbacks
  const ratings = skill.ratings || { current: 0, desired: 0 };
  
  // Ensure ratings are numbers
  const current = typeof ratings.current === 'number' ? 
    ratings.current : Number(ratings.current || 0);
    
  const desired = typeof ratings.desired === 'number' ? 
    ratings.desired : Number(ratings.desired || 0);
  
  // Calculate gap as absolute difference
  const gap = Math.abs(desired - current);
  
  return {
    id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
    name: skillName,
    categoryTitle,
    gap,
    ratings: { current, desired }
  };
};

// Get all skills with metadata information
export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.log("getAllSkillsWithMetadata: No valid categories provided");
    return [];
  }
  
  const result: SkillWithMetadata[] = [];
  
  for (const category of categories) {
    if (!category || !category.title) {
      console.log("getAllSkillsWithMetadata: Invalid category");
      continue;
    }
    
    if (!category.skills || !Array.isArray(category.skills)) {
      console.log(`getAllSkillsWithMetadata: No skills array in category ${category.title}`);
      continue;
    }
    
    for (const skill of category.skills) {
      const normalizedSkill = normalizeSkill(skill, category.title);
      if (normalizedSkill) {
        result.push(normalizedSkill);
      }
    }
  }
  
  console.log(`getAllSkillsWithMetadata: Processed ${result.length} valid skills`);
  return result;
};

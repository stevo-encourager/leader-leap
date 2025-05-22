
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';

// Helper function to normalize skill data
export const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  // Skip invalid skills
  if (!skill) {
    console.log("normalizeSkill - Invalid skill:", skill);
    return null;
  }
  
  // Debug the incoming skill
  console.log("normalizeSkill - Processing skill:", skill.name, "with ratings:", skill.ratings);
  
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
  
  const result = {
    id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
    name: skillName,
    categoryTitle,
    gap,
    ratings: { current, desired }
  };
  
  console.log(`normalizeSkill - Normalized skill "${skillName}" with gap ${gap}`);
  return result;
};

// Get all skills with metadata information
export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  console.log("getAllSkillsWithMetadata - Input:", 
    categories?.length,
    categories?.map(c => c?.title)
  );
  
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getAllSkillsWithMetadata received invalid categories:", categories);
    return [];
  }
  
  if (categories.length === 0) {
    console.log("getAllSkillsWithMetadata: No categories provided");
    return [];
  }
  
  const result: SkillWithMetadata[] = [];
  
  for (const category of categories) {
    // Skip undefined categories
    if (!category) {
      console.log("getAllSkillsWithMetadata: Found undefined category in array");
      continue;
    }
    
    if (!category.title) {
      console.log("getAllSkillsWithMetadata: Invalid category missing title");
      continue;
    }
    
    // Handle missing skills array
    if (!category.skills || !Array.isArray(category.skills)) {
      console.log(`getAllSkillsWithMetadata: No skills array in category ${category.title}`);
      continue;
    }
    
    console.log(`getAllSkillsWithMetadata: Processing ${category.skills.length} skills in category ${category.title}`);
    
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

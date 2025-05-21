
import { Category, Skill } from './assessmentTypes';

/**
 * Normalizes categories data to ensure consistent format for display
 */
export const normalizeCategories = (categories: any[]): Category[] => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return [];
  }

  return categories.map(category => {
    if (!category || typeof category !== 'object') {
      return {
        id: `category-${Math.random().toString(36).substring(2, 9)}`,
        title: "Unknown Category",
        description: "",
        skills: []
      };
    }
    
    // Get basic category info
    const categoryId = category.id || `category-${Math.random().toString(36).substring(2, 9)}`;
    const categoryTitle = category.title || "Unknown Category";
    const categoryDescription = category.description || "";
    
    // Normalize skills
    const skills = category.skills && Array.isArray(category.skills) 
      ? normalizeSkills(category.skills)
      : [];
    
    return {
      id: categoryId,
      title: categoryTitle,
      description: categoryDescription,
      skills
    };
  });
};

/**
 * Normalizes skills data to ensure consistent format for display
 */
export const normalizeSkills = (skills: any[]): Skill[] => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return [];
  }

  return skills.map(skill => {
    if (!skill || typeof skill !== 'object') {
      return {
        id: `skill-${Math.random().toString(36).substring(2, 9)}`,
        name: "Unknown Skill",
        description: "",
        ratings: { current: 0, desired: 0 }
      };
    }
    
    // Create a normalized skill object
    const normalizedSkill: Skill = {
      id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
      name: skill.name || skill.competency || "Unnamed Skill",
      description: skill.description || "",
      ratings: { 
        current: 0,
        desired: 0
      }
    };
    
    // Handle ratings properly, ensuring they're always numbers
    if (skill.ratings) {
      // Directly convert to numbers to ensure consistent handling
      normalizedSkill.ratings.current = Number(skill.ratings.current || 0);
      normalizedSkill.ratings.desired = Number(skill.ratings.desired || 0);
    }
    
    return normalizedSkill;
  });
};

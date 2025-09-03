
import { Category, Skill } from './assessmentTypes';
import { logger } from './productionLogger';

/**
 * Normalizes categories data to ensure consistent format for display
 */
export const normalizeCategories = (categories: unknown[]): Category[] => {
  
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    logger.warn("normalizeCategories - Invalid or empty categories input");
    return [];
  }

  try {
    const result = categories.map(category => {
      if (!category || typeof category !== 'object') {
        logger.warn("normalizeCategories - Invalid category object:", category);
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
      const rawSkills = category.skills;
      let skills: Skill[] = [];
      
      if (rawSkills && Array.isArray(rawSkills)) {
        skills = normalizeSkills(rawSkills);
      } else {
        logger.warn(`normalizeCategories - Invalid skills array in category ${categoryTitle}`);
      }
      
      return {
        id: categoryId,
        title: categoryTitle,
        description: categoryDescription,
        skills
      };
    });
    
    return result;
  } catch (error) {
    logger.error("Error in normalizeCategories:", error);
    return [];
  }
};

/**
 * Normalizes skills data to ensure consistent format for display
 */
export const normalizeSkills = (skills: unknown[]): Skill[] => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    logger.warn("normalizeSkills - Invalid or empty skills input");
    return [];
  }

  try {
    return skills.map(skill => {
      if (!skill || typeof skill !== 'object') {
        logger.warn("normalizeSkills - Invalid skill object:", skill);
        return {
          id: `skill-${Math.random().toString(36).substring(2, 9)}`,
          name: "Unknown Skill",
          description: "",
          ratings: { current: 0, desired: 0 }
        };
      }
      
      // Create a normalized skill object
      const skillName = skill.name || skill.competency || "Unnamed Skill";
      const skillId = skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`;
      const skillDescription = skill.description || "";
      
      // Handle ratings properly, ensuring they're always numbers
      let current = 0;
      let desired = 0;
      
      if (skill.ratings) {
        // Parse ratings as numbers with fallback to 0
        current = Number(skill.ratings.current) || 0;
        desired = Number(skill.ratings.desired) || 0;
      }
      
      return {
        id: skillId,
        name: skillName,
        description: skillDescription,
        ratings: { current, desired }
      };
    });
  } catch (error) {
    logger.error("Error in normalizeSkills:", error);
    return [];
  }
};

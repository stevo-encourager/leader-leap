
import { Category, Skill } from './assessmentTypes';

/**
 * Normalizes categories data to ensure consistent format for display
 */
export const normalizeCategories = (categories: any[]): Category[] => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return [];
  }

  return categories.map(category => {
    if (!category || !category.title) {
      console.error("Found undefined category in categories array");
      return {
        id: `category-${Math.random().toString(36).substring(2, 9)}`,
        title: "Unknown Category",
        description: "",
        skills: []
      };
    }
    
    if (!category.skills || !Array.isArray(category.skills)) {
      console.warn(`Category ${category.title} has no skills or skills is not an array`);
      return {
        ...category,
        skills: []
      };
    }
    
    const normalizedSkills = normalizeSkills(category.skills, category.title);
    
    return { ...category, skills: normalizedSkills };
  });
};

/**
 * Normalizes skills data to ensure consistent format for display
 */
export const normalizeSkills = (skills: any[], categoryTitle: string): Skill[] => {
  if (!skills || !Array.isArray(skills)) {
    return [];
  }

  return skills.map(skill => {
    if (!skill) {
      console.error(`Found undefined skill in category ${categoryTitle}`);
      return {
        id: `skill-${Math.random().toString(36).substring(2, 9)}`,
        name: "Unknown Skill",
        description: "",
        ratings: { current: 0, desired: 0 }
      };
    }
    
    // Create a normalized skill object
    let normalizedSkill: Skill = { ...skill };
    
    // Handle the case where competency is used instead of name
    if (!skill.name && skill.competency) {
      normalizedSkill.name = skill.competency;
    }
    
    // Ensure skill has a name
    if (!normalizedSkill.name) {
      normalizedSkill.name = "Unnamed Skill";
    }
    
    // Ensure ratings exist and are numbers
    if (!normalizedSkill.ratings) {
      console.warn(`No ratings for skill ${normalizedSkill.name} in ${categoryTitle}`);
      normalizedSkill.ratings = { current: 0, desired: 0 };
    } else {
      // Convert string ratings to numbers if needed
      if (typeof normalizedSkill.ratings.current !== 'number') {
        const parsedCurrent = Number(normalizedSkill.ratings.current);
        normalizedSkill.ratings.current = isNaN(parsedCurrent) ? 0 : parsedCurrent;
      }
      if (typeof normalizedSkill.ratings.desired !== 'number') {
        const parsedDesired = Number(normalizedSkill.ratings.desired);
        normalizedSkill.ratings.desired = isNaN(parsedDesired) ? 0 : parsedDesired;
      }
    }
    
    // Ensure skill has an ID
    if (!normalizedSkill.id) {
      normalizedSkill.id = `skill-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    return normalizedSkill;
  });
};

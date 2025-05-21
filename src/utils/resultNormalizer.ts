
import { Category, Skill } from './assessmentTypes';

/**
 * Normalizes categories data to ensure consistent format for display
 */
export const normalizeCategories = (categories: any[]): Category[] => {
  console.log("normalizeCategories - Input:", categories);
  
  if (!categories) {
    console.error("normalizeCategories - Categories is undefined or null");
    return [];
  }
  
  if (!Array.isArray(categories)) {
    console.error("normalizeCategories - Categories is not an array:", typeof categories);
    // Try to make it an array
    const categoriesArray = [categories];
    console.log("normalizeCategories - Converted to array:", categoriesArray);
    categories = categoriesArray;
  }
  
  if (categories.length === 0) {
    console.warn("normalizeCategories - Empty categories array");
    return [];
  }

  const normalizedCategories = categories.map(category => {
    if (!category || typeof category !== 'object') {
      console.error("normalizeCategories - Found invalid category:", category);
      return {
        id: `category-${Math.random().toString(36).substring(2, 9)}`,
        title: "Unknown Category",
        description: "",
        skills: []
      };
    }
    
    // Ensure category has an ID
    const categoryId = category.id || `category-${Math.random().toString(36).substring(2, 9)}`;
    
    // Ensure category has a title
    const categoryTitle = category.title || "Unknown Category";
    
    // Ensure category has a description
    const categoryDescription = category.description || "";
    
    console.log(`normalizeCategories - Processing category: ${categoryTitle}`);
    
    // Handle skills array
    let skills: Skill[] = [];
    if (category.skills) {
      if (Array.isArray(category.skills)) {
        skills = normalizeSkills(category.skills, categoryTitle);
      } else {
        console.warn(`normalizeCategories - Category ${categoryTitle} has invalid skills (not an array):`, typeof category.skills);
      }
    } else {
      console.warn(`normalizeCategories - Category ${categoryTitle} has no skills property`);
    }
    
    return {
      id: categoryId,
      title: categoryTitle,
      description: categoryDescription,
      skills
    };
  });
  
  console.log("normalizeCategories - Output:", normalizedCategories);
  
  return normalizedCategories;
};

/**
 * Normalizes skills data to ensure consistent format for display
 */
export const normalizeSkills = (skills: any[], categoryTitle: string): Skill[] => {
  if (!skills) {
    console.error(`normalizeSkills - Skills is undefined or null for category ${categoryTitle}`);
    return [];
  }
  
  if (!Array.isArray(skills)) {
    console.error(`normalizeSkills - Skills is not an array for category ${categoryTitle}:`, typeof skills);
    return [];
  }
  
  if (skills.length === 0) {
    console.warn(`normalizeSkills - Empty skills array for category ${categoryTitle}`);
    return [];
  }

  console.log(`Processing ${skills.length} skills for category ${categoryTitle}`);
  
  return skills.map((skill, index) => {
    if (!skill || typeof skill !== 'object') {
      console.error(`normalizeSkills - Found invalid skill at index ${index} in ${categoryTitle}:`, skill);
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
      ratings: { current: 0, desired: 0 } // Start with zeros
    };
    
    // Get original ratings directly
    if (skill.ratings) {
      if (typeof skill.ratings === 'object') {
        // Get original values as numbers
        const currentRating = Number(skill.ratings.current);
        const desiredRating = Number(skill.ratings.desired);
        
        console.log(`Original ratings for ${normalizedSkill.name}: Current=${skill.ratings.current} (${typeof skill.ratings.current}), Desired=${skill.ratings.desired} (${typeof skill.ratings.desired})`);
        
        // Use original values without applying defaults
        normalizedSkill.ratings.current = !isNaN(currentRating) ? currentRating : 0;
        normalizedSkill.ratings.desired = !isNaN(desiredRating) ? desiredRating : 0;
        
        console.log(`Normalized ratings for ${normalizedSkill.name}: Current=${normalizedSkill.ratings.current}, Desired=${normalizedSkill.ratings.desired}, Gap=${Math.abs(normalizedSkill.ratings.desired - normalizedSkill.ratings.current)}`);
      }
    }
    
    return normalizedSkill;
  });
};

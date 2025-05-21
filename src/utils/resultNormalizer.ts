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
  
  // Only set test values if ALL ratings are zero
  const allZeros = normalizedCategories.every(cat => 
    cat.skills.every(skill => 
      (skill.ratings.current === 0 || !skill.ratings.current) && 
      (skill.ratings.desired === 0 || !skill.ratings.desired)
    )
  );
  
  if (allZeros && normalizedCategories.length > 0 && normalizedCategories[0].skills.length > 0) {
    console.log("normalizeCategories - All ratings are 0, setting default values on 1-10 scale");
    // Only set default test values when absolutely needed
  }
  
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

  return skills.map((skill, index) => {
    if (!skill || typeof skill !== 'object') {
      console.error(`normalizeSkills - Found invalid skill at index ${index} in ${categoryTitle}:`, skill);
      return {
        id: `skill-${Math.random().toString(36).substring(2, 9)}`,
        name: "Unknown Skill",
        description: "",
        ratings: { current: 3, desired: 8 } // Default using full 1-10 scale
      };
    }
    
    // Create a normalized skill object
    const normalizedSkill: Skill = {
      id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
      name: skill.name || skill.competency || "Unnamed Skill",
      description: skill.description || "",
      ratings: { current: 0, desired: 0 } // Start with zeros to detect if we need defaults later
    };
    
    // Normalize ratings - preserve original values when available
    if (skill.ratings) {
      if (typeof skill.ratings === 'object') {
        // Convert ratings to numbers without modifying them
        let currentRating = typeof skill.ratings.current === 'number' 
          ? skill.ratings.current 
          : parseFloat(String(skill.ratings.current || '0'));
          
        let desiredRating = typeof skill.ratings.desired === 'number' 
          ? skill.ratings.desired 
          : parseFloat(String(skill.ratings.desired || '0'));
        
        // Only set defaults if both values are invalid
        if ((isNaN(currentRating) || currentRating === 0) && (isNaN(desiredRating) || desiredRating === 0)) {
          currentRating = 3;
          desiredRating = 8;
        } else {
          // Ensure individual values are valid
          if (isNaN(currentRating) || currentRating === 0) currentRating = 1;
          if (isNaN(desiredRating) || desiredRating === 0) desiredRating = Math.min(currentRating + 2, 10);
          
          // Ensure values are within range
          currentRating = Math.max(1, Math.min(10, currentRating));
          desiredRating = Math.max(1, Math.min(10, desiredRating));
        }
        
        normalizedSkill.ratings.current = currentRating;
        normalizedSkill.ratings.desired = desiredRating;
        
        console.log(`normalizeSkills - Processed ${normalizedSkill.name} in ${categoryTitle}: Current=${currentRating}, Desired=${desiredRating}`);
      } else {
        console.warn(`normalizeSkills - Invalid ratings format for ${normalizedSkill.name} in ${categoryTitle}:`, skill.ratings);
        normalizedSkill.ratings = { current: 3, desired: 8 }; // Default only when needed
      }
    } else {
      console.warn(`normalizeSkills - No ratings for skill ${normalizedSkill.name} in ${categoryTitle}`);
      normalizedSkill.ratings = { current: 3, desired: 8 }; // Default only when needed
    }
    
    return normalizedSkill;
  });
};

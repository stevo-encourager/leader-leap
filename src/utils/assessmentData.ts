import { SkillRating, Skill, Category, Demographics, AssessmentStep } from './assessmentTypes';
import { allCategories } from './assessmentCategories';
import { logger } from './productionLogger';

// Export the types for use elsewhere in the application using explicit 'export type'
export type { SkillRating, Skill, Category, Demographics, AssessmentStep };

// Ensure we export a properly cloned version of the categories to avoid reference issues
export const initialCategories: Category[] = JSON.parse(JSON.stringify(allCategories));

// Add a debugging function to verify category data structure
export const validateCategoriesData = (categories: Category[] | undefined): boolean => {
  if (!categories || !Array.isArray(categories)) {
    logger.error("validateCategoriesData: Categories is not an array");
    return false;
  }
  
  if (categories.length === 0) {
    logger.error("validateCategoriesData: Categories array is empty");
    return false;
  }
  
  // Check schema integrity of each category
  for (const category of categories) {
    if (!category.id || !category.title || !category.description) {
      logger.error("validateCategoriesData: Invalid category structure", category);
      return false;
    }
    
    if (!Array.isArray(category.skills) || category.skills.length === 0) {
      logger.error("validateCategoriesData: Category has no skills", category);
      return false;
    }
    
    for (const skill of category.skills) {
      if (!skill.id || !skill.name) {
        logger.error("validateCategoriesData: Invalid skill structure", skill);
        return false;
      }
    }
  }
  
  return true;
};

// Export the initial categories count for debugging
export const initialCategoriesCount = allCategories.length;

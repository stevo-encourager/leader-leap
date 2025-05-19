
import { SkillRating, Skill, Category, Demographics, AssessmentStep } from './assessmentTypes';
import { allCategories } from './assessmentCategories';

// Export the types for use elsewhere in the application using explicit 'export type'
export type { SkillRating, Skill, Category, Demographics, AssessmentStep };

// Export the categories data
export const initialCategories: Category[] = allCategories;

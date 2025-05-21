
// Main entry point that re-exports all assessment calculation functions

// Types
export type { SkillWithMetadata, CategoryWithMetadata } from './types';

// Normalizers
export { normalizeSkill, getAllSkillsWithMetadata } from './normalizers';

// Average calculations
export { calculateAverageGap } from './averages';

// Category-level metrics
export { 
  getCategoriesWithMetadata,
  getLargestCategoryGaps,
  getSmallestCategoryGaps
} from './categoryMetrics';

// Skill-level metrics
export {
  getTopStrengths,
  getLowestSkills,
  getLargestGaps,
  getSmallestGaps,
  getSkillsToImprove,
  getSkillsMeetingExpectations
} from './skillMetrics';

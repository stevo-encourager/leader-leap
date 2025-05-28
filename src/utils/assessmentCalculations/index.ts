
// Main entry point that re-exports all assessment calculation functions

// Types
export type { SkillWithMetadata, CategoryWithMetadata, InsightData } from './types';

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

// Import the functions we need for calculateInsights
import { 
  getLargestGaps, 
  getSmallestGaps, 
  getSkillsMeetingExpectations 
} from './skillMetrics';

// Add the missing calculateInsights function with proper imports
export const calculateInsights = (categories: any[]) => {
  return {
    largestGaps: getLargestGaps(categories, 5),
    smallestGaps: getSmallestGaps(categories, 5),
    skillsMeetingExpectations: getSkillsMeetingExpectations(categories, 5)
  };
};

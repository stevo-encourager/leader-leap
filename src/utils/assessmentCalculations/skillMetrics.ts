
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';
import { getAllSkillsWithMetadata } from './normalizers';

// Get top strengths (highest current rating)
export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getTopStrengths received invalid categories:", categories);
    return [];
  }
  
  const allSkills = getAllSkillsWithMetadata(categories);
  if (!allSkills || allSkills.length === 0) return [];
  
  // Filter out any invalid skills first
  const validSkills = allSkills.filter(skill => 
    skill && typeof skill.ratings?.current === 'number' && skill.ratings.current > 0
  );
  
  if (validSkills.length === 0) return [];
  
  return [...validSkills]
    .sort((a, b) => b.ratings.current - a.ratings.current)
    .slice(0, count);
};

// Get lowest skills (lowest current rating)
export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getLowestSkills received invalid categories:", categories);
    return [];
  }
  
  const allSkills = getAllSkillsWithMetadata(categories);
  if (!allSkills || allSkills.length === 0) return [];
  
  // Only include skills with non-zero current ratings
  const nonZeroSkills = allSkills.filter(skill => 
    skill && typeof skill.ratings?.current === 'number' && skill.ratings.current > 0
  );
  
  if (nonZeroSkills.length === 0) return [];
  
  return [...nonZeroSkills]
    .sort((a, b) => a.ratings.current - b.ratings.current)
    .slice(0, count);
};

// Get skills with largest gaps
export const getLargestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getLargestGaps received invalid categories:", categories);
    return [];
  }
  
  const allSkills = getAllSkillsWithMetadata(categories);
  if (!allSkills || allSkills.length === 0) return [];
  
  // Only include skills with actual gaps
  const validSkills = allSkills.filter(skill => 
    skill && typeof skill.gap === 'number' && skill.gap > 0
  );
  
  if (validSkills.length === 0) return [];
  
  return [...validSkills]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count);
};

// Get skills with smallest gaps
export const getSmallestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getSmallestGaps received invalid categories:", categories);
    return [];
  }
  
  const allSkills = getAllSkillsWithMetadata(categories);
  if (!allSkills || allSkills.length === 0) return [];
  
  // Filter out skills with zero gap
  const nonZeroGapSkills = allSkills.filter(skill => 
    skill && typeof skill.gap === 'number' && skill.gap > 0
  );
  
  if (nonZeroGapSkills.length === 0) return [];
  
  return [...nonZeroGapSkills]
    .sort((a, b) => a.gap - b.gap)
    .slice(0, count);
};

// Get skills to improve (highest desired rating with a gap)
export const getSkillsToImprove = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getSkillsToImprove received invalid categories:", categories);
    return [];
  }
  
  const allSkills = getAllSkillsWithMetadata(categories);
  if (!allSkills || allSkills.length === 0) return [];
  
  // Focus on skills with meaningful gaps
  const validSkills = allSkills.filter(skill => 
    skill && 
    typeof skill.gap === 'number' && 
    skill.gap > 0 && 
    typeof skill.ratings?.desired === 'number' && 
    skill.ratings.desired > 0
  );
  
  if (validSkills.length === 0) return [];
  
  return [...validSkills]
    .sort((a, b) => b.ratings.desired - a.ratings.desired)
    .slice(0, count);
};

// Get skills meeting expectations (smallest gap)
export const getSkillsMeetingExpectations = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  // Add defensive check for undefined or null categories
  if (!categories || !Array.isArray(categories)) {
    console.error("getSkillsMeetingExpectations received invalid categories:", categories);
    return [];
  }
  
  const allSkills = getAllSkillsWithMetadata(categories);
  if (!allSkills || allSkills.length === 0) return [];
  
  // Sort by gap (smallest to largest) among skills with positive current ratings
  const validSkills = allSkills.filter(skill => 
    skill && 
    typeof skill.ratings?.current === 'number' && 
    skill.ratings.current > 0
  );
  
  if (validSkills.length === 0) return [];
  
  return [...validSkills]
    .sort((a, b) => a.gap - b.gap)
    .slice(0, count);
};

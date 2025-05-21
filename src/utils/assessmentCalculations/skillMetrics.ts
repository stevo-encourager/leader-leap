
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';
import { getAllSkillsWithMetadata } from './normalizers';

// Get top strengths (highest current rating)
export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .sort((a, b) => b.ratings.current - a.ratings.current)
    .slice(0, count);
};

// Get lowest skills (lowest current rating)
export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  // Only include skills with non-zero current ratings
  const nonZeroSkills = allSkills.filter(skill => skill.ratings.current > 0);
  
  return [...nonZeroSkills]
    .sort((a, b) => a.ratings.current - b.ratings.current)
    .slice(0, count);
};

// Get skills with largest gaps
export const getLargestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .filter(skill => skill.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count);
};

// Get skills with smallest gaps
export const getSmallestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  // Filter out skills with zero gap
  const nonZeroGapSkills = allSkills.filter(skill => skill.gap > 0);
  
  return [...nonZeroGapSkills]
    .sort((a, b) => a.gap - b.gap)
    .slice(0, count);
};

// Get skills to improve (highest desired rating with a gap)
export const getSkillsToImprove = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  // Focus on skills with meaningful gaps
  return [...allSkills]
    .filter(skill => skill.gap > 0)
    .sort((a, b) => b.ratings.desired - a.ratings.desired)
    .slice(0, count);
};

// Get skills meeting expectations (smallest gap)
export const getSkillsMeetingExpectations = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  // Sort by gap (smallest to largest) among skills with positive current ratings
  return [...allSkills]
    .filter(skill => skill.ratings.current > 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, count);
};

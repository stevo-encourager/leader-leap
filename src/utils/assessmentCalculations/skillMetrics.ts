
import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';
import { getAllSkillsWithMetadata } from './normalizers';

// Get top strengths (highest current rating)
export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    return [...allSkills]
      .sort((a, b) => b.ratings.current - a.ratings.current)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getTopStrengths:", error);
    return [];
  }
};

// Get lowest skills (lowest current rating)
export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    return [...allSkills]
      .sort((a, b) => a.ratings.current - b.ratings.current)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getLowestSkills:", error);
    return [];
  }
};

// Get skills with largest gaps
export const getLargestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    return [...allSkills]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getLargestGaps:", error);
    return [];
  }
};

// Get skills with smallest gaps
export const getSmallestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    // Filter out skills with zero gap to avoid showing meaningless results
    const nonZeroGapSkills = allSkills.filter(skill => skill.gap > 0);
    
    return [...nonZeroGapSkills]
      .sort((a, b) => a.gap - b.gap)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSmallestGaps:", error);
    return [];
  }
};

// Get skills to improve (highest desired rating)
export const getSkillsToImprove = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    // Sort by desired rating (high to low) to find skills the user wants to focus on
    return [...allSkills]
      .sort((a, b) => b.ratings.desired - a.ratings.desired)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSkillsToImprove:", error);
    return [];
  }
};

// Get skills meeting expectations (highest current rating)
export const getSkillsMeetingExpectations = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  try {
    const allSkills = getAllSkillsWithMetadata(categories);
    if (allSkills.length === 0) return [];
    
    // Sort by current rating (high to low) to find skills the user is already good at
    return [...allSkills]
      .sort((a, b) => b.ratings.current - a.ratings.current)
      .slice(0, count);
  } catch (error) {
    console.error("Error in getSkillsMeetingExpectations:", error);
    return [];
  }
};


import { Category } from '../assessmentTypes';
import { SkillWithMetadata } from './types';
import { getAllSkillsWithMetadata } from './normalizers';

/**
 * Returns skills with the highest current ratings
 */
export const getTopStrengths = (categories: Category[], limit = 5): SkillWithMetadata[] => {
  try {
    console.log("getTopStrengths - Processing categories:", categories?.length || 0);
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log("getTopStrengths - No categories");
      return [];
    }
    
    // Get all skills with metadata
    const allSkills = getAllSkillsWithMetadata(categories);
    console.log(`getTopStrengths - Got ${allSkills.length} total skills with metadata`);
    
    if (allSkills.length === 0) {
      console.log("getTopStrengths - No skills with metadata found");
      return [];
    }
    
    // Only include skills with valid ratings
    const validSkills = allSkills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      !isNaN(skill.ratings.current) &&
      skill.ratings.current > 0
    );
    
    console.log(`getTopStrengths - Found ${validSkills.length} skills with valid current ratings`);
    
    if (validSkills.length === 0) {
      return [];
    }
    
    // Sort by current rating (highest first)
    const sortedSkills = [...validSkills].sort((a, b) => {
      return b.ratings.current - a.ratings.current;
    });
    
    // Return top N skills
    const topSkills = sortedSkills.slice(0, limit);
    console.log(`getTopStrengths - Returning top ${topSkills.length} skills`);
    
    return topSkills;
  } catch (error) {
    console.error("Error in getTopStrengths:", error);
    return [];
  }
};

/**
 * Returns skills with the lowest current ratings
 */
export const getLowestSkills = (categories: Category[], limit = 5): SkillWithMetadata[] => {
  try {
    console.log("getLowestSkills - Processing categories:", categories?.length || 0);
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log("getLowestSkills - No categories");
      return [];
    }
    
    // Get all skills with metadata
    const allSkills = getAllSkillsWithMetadata(categories);
    
    if (allSkills.length === 0) {
      console.log("getLowestSkills - No skills with metadata found");
      return [];
    }
    
    // Only include skills with valid ratings
    const validSkills = allSkills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      !isNaN(skill.ratings.current) &&
      skill.ratings.current > 0
    );
    
    console.log(`getLowestSkills - Found ${validSkills.length} skills with valid current ratings`);
    
    if (validSkills.length === 0) {
      return [];
    }
    
    // Sort by current rating (lowest first)
    const sortedSkills = [...validSkills].sort((a, b) => {
      return a.ratings.current - b.ratings.current;
    });
    
    // Return bottom N skills
    const lowestSkills = sortedSkills.slice(0, limit);
    console.log(`getLowestSkills - Returning lowest ${lowestSkills.length} skills`);
    
    return lowestSkills;
  } catch (error) {
    console.error("Error in getLowestSkills:", error);
    return [];
  }
};

/**
 * Returns skills with largest gap (desired - current)
 */
export const getLargestGaps = (categories: Category[], limit = 5): SkillWithMetadata[] => {
  try {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    // Get all skills with metadata
    const allSkills = getAllSkillsWithMetadata(categories);
    
    // Only include skills with valid ratings for both current and desired
    const validSkills = allSkills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number' && 
      !isNaN(skill.ratings.current) && 
      !isNaN(skill.ratings.desired) &&
      skill.ratings.current > 0 &&
      skill.ratings.desired > 0
    );
    
    if (validSkills.length === 0) {
      return [];
    }
    
    // Sort by gap size (largest first)
    const sortedSkills = [...validSkills].sort((a, b) => {
      return b.gap - a.gap;
    });
    
    // Return top N skills
    return sortedSkills.slice(0, limit);
  } catch (error) {
    console.error("Error in getLargestGaps:", error);
    return [];
  }
};

/**
 * Returns skills with smallest gap (desired - current)
 */
export const getSmallestGaps = (categories: Category[], limit = 5): SkillWithMetadata[] => {
  try {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    // Get all skills with metadata
    const allSkills = getAllSkillsWithMetadata(categories);
    
    // Only include skills with valid ratings for both current and desired
    const validSkills = allSkills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number' && 
      !isNaN(skill.ratings.current) && 
      !isNaN(skill.ratings.desired) &&
      skill.ratings.current > 0 &&
      skill.ratings.desired > 0
    );
    
    if (validSkills.length === 0) {
      return [];
    }
    
    // Sort by gap size (smallest first)
    const sortedSkills = [...validSkills].sort((a, b) => {
      return Math.abs(a.gap) - Math.abs(b.gap);
    });
    
    // Return top N skills
    return sortedSkills.slice(0, limit);
  } catch (error) {
    console.error("Error in getSmallestGaps:", error);
    return [];
  }
};

/**
 * Returns skills with largest gaps and high desired value
 */
export const getSkillsToImprove = (categories: Category[], limit = 5): SkillWithMetadata[] => {
  try {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    // Get all skills with metadata
    const allSkills = getAllSkillsWithMetadata(categories);
    
    // Only include skills with valid ratings for both current and desired
    const validSkills = allSkills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number' && 
      !isNaN(skill.ratings.current) && 
      !isNaN(skill.ratings.desired) &&
      skill.ratings.current > 0 &&
      skill.ratings.desired > 0 &&
      skill.gap > 0
    );
    
    if (validSkills.length === 0) {
      return [];
    }
    
    // Sort by gap size and desired value (higher desired value breaks ties)
    const sortedSkills = [...validSkills].sort((a, b) => {
      if (b.gap === a.gap) {
        return b.ratings.desired - a.ratings.desired;
      }
      return b.gap - a.gap;
    });
    
    // Return top N skills
    return sortedSkills.slice(0, limit);
  } catch (error) {
    console.error("Error in getSkillsToImprove:", error);
    return [];
  }
};

/**
 * Returns skills with smallest gaps and high current value
 */
export const getSkillsMeetingExpectations = (categories: Category[], limit = 5): SkillWithMetadata[] => {
  try {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    // Get all skills with metadata
    const allSkills = getAllSkillsWithMetadata(categories);
    
    // Only include skills with valid ratings for both current and desired
    const validSkills = allSkills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number' && 
      !isNaN(skill.ratings.current) && 
      !isNaN(skill.ratings.desired) &&
      skill.ratings.current > 0 &&
      skill.ratings.desired > 0
    );
    
    if (validSkills.length === 0) {
      return [];
    }
    
    // Sort by gap size (smallest first) and current value (higher current breaks ties)
    const sortedSkills = [...validSkills].sort((a, b) => {
      const gapDiff = Math.abs(a.gap) - Math.abs(b.gap);
      if (gapDiff === 0) {
        return b.ratings.current - a.ratings.current;
      }
      return gapDiff;
    });
    
    // Return top N skills
    return sortedSkills.slice(0, limit);
  } catch (error) {
    console.error("Error in getSkillsMeetingExpectations:", error);
    return [];
  }
};

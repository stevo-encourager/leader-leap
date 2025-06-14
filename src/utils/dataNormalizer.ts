import { Category, Demographics, Skill, SkillRating } from "@/utils/assessmentTypes";
import { LocalAssessmentData } from "@/types/assessment";

/**
 * Generates a unique ID with an optional prefix
 */
export const generateId = (prefix: string = ''): string => 
  `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Normalizes a rating value to ensure it's a valid number
 */
export const normalizeRating = (value: any): number => {
  const parsed = Number(value);
  return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
};

/**
 * Normalizes a skill rating object
 */
export const normalizeSkillRating = (rating: any): SkillRating => {
  if (!rating || typeof rating !== 'object') {
    return { current: 0, desired: 0 };
  }
  
  return {
    current: normalizeRating(rating.current),
    desired: normalizeRating(rating.desired)
  };
};

/**
 * Normalizes a skill object
 */
export const normalizeSkill = (skill: any): Skill => {
  if (!skill || typeof skill !== 'object') {
    return {
      id: generateId('skill'),
      name: 'Unknown Skill',
      description: '',
      ratings: { current: 0, desired: 0 }
    };
  }
  
  return {
    id: skill.id || generateId('skill'),
    name: skill.name || skill.competency || 'Unknown Skill',
    description: skill.description || '',
    ratings: normalizeSkillRating(skill.ratings)
  };
};

/**
 * Normalizes a category object
 */
export const normalizeCategory = (category: any): Category => {
  if (!category || typeof category !== 'object') {
    return {
      id: generateId('category'),
      title: 'Unknown Category',
      description: '',
      skills: []
    };
  }
  
  return {
    id: category.id || generateId('category'),
    title: category.title || 'Unknown Category',
    description: category.description || '',
    skills: Array.isArray(category.skills)
      ? category.skills.map(normalizeSkill)
      : []
  };
};

/**
 * Normalizes an array of category objects
 */
export const normalizeCategories = (categories: any): Category[] => {
  if (!categories || !Array.isArray(categories)) {
    console.error("normalizeCategories - Input is not an array:", categories);
    return [];
  }
  
  return categories.map(normalizeCategory);
};

/**
 * Normalizes a demographics object
 */
export const normalizeDemographics = (demographics: any): Demographics => {
  if (!demographics || typeof demographics !== 'object') {
    return {};
  }
  
  return {
    age: demographics.age || undefined,
    gender: demographics.gender || undefined,
    industry: demographics.industry || undefined,
    experience: demographics.experience || undefined
  };
};

/**
 * Normalizes local assessment data
 */
export const normalizeLocalAssessmentData = (data: any): LocalAssessmentData | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  
  return {
    categories: normalizeCategories(data.categories),
    demographics: normalizeDemographics(data.demographics),
    timestamp: data.timestamp || new Date().toISOString()
  };
};

/**
 * Checks if categories have any valid ratings
 */
export const hasValidRatings = (categories: Category[]): boolean => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return false;
  }
  
  return categories.some(category => 
    category && Array.isArray(category.skills) &&
    category.skills.some(skill => {
      if (!skill || !skill.ratings) return false;
      return skill.ratings.current > 0 || skill.ratings.desired > 0;
    })
  );
};

/**
 * Count total skills and skills with ratings
 */
export const countSkillsWithRatings = (categories: Category[]): { 
  total: number; 
  withRatings: number;
} => {
  let total = 0;
  let withRatings = 0;
  
  categories.forEach(category => {
    if (category && Array.isArray(category.skills)) {
      total += category.skills.length;
      
      category.skills.forEach(skill => {
        if (skill && skill.ratings && 
           (skill.ratings.current > 0 || skill.ratings.desired > 0)) {
          withRatings++;
        }
      });
    }
  });
  
  return { total, withRatings };
};

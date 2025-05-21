
import { Category } from './assessmentTypes';

export interface SkillWithMetadata {
  id: string;
  name: string;
  categoryTitle: string;
  gap: number;
  ratings: {
    current: number;
    desired: number;
  };
}

// Helper function to normalize skill data
const normalizeSkill = (skill: any, categoryTitle: string): SkillWithMetadata | null => {
  // Handle both name and competency fields
  const skillName = skill.name || skill.competency || 'Unknown Skill';
  
  // Ensure we have valid ratings
  let current = typeof skill.ratings?.current === 'number' 
    ? skill.ratings.current 
    : parseFloat(String(skill.ratings?.current || '0'));
    
  let desired = typeof skill.ratings?.desired === 'number' 
    ? skill.ratings.desired 
    : parseFloat(String(skill.ratings?.desired || '0'));
  
  // Skip invalid ratings
  if (isNaN(current) || isNaN(desired)) {
    console.warn(`Invalid ratings for skill: ${skillName}`, skill);
    return null;
  }
  
  const gap = parseFloat(Math.abs(desired - current).toFixed(2));
  
  return {
    id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
    name: skillName,
    categoryTitle,
    gap,
    ratings: { current, desired }
  };
};

export const calculateAverageGap = (categories: Category[]): number => {
  if (!categories || categories.length === 0) {
    console.warn("No categories provided to calculateAverageGap");
    return 0;
  }
  
  let totalSkillCount = 0;
  let totalGapValue = 0;
  
  categories.forEach(category => {
    if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) return;
    
    category.skills.forEach(skill => {
      const normalizedSkill = normalizeSkill(skill, category.title);
      
      if (normalizedSkill) {
        totalSkillCount++;
        totalGapValue += normalizedSkill.gap;
      }
    });
  });
  
  if (totalSkillCount === 0) return 0;
  return parseFloat((totalGapValue / totalSkillCount).toFixed(2));
};

export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  if (!categories || categories.length === 0) return [];
  
  const result: SkillWithMetadata[] = [];
  
  categories.forEach(category => {
    if (!category.skills || !Array.isArray(category.skills)) return;
    
    category.skills.forEach(skill => {
      const normalizedSkill = normalizeSkill(skill, category.title);
      if (normalizedSkill) {
        result.push(normalizedSkill);
      }
    });
  });
  
  return result;
};

export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .sort((a, b) => b.ratings.current - a.ratings.current)
    .slice(0, count);
};

export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .sort((a, b) => a.ratings.current - b.ratings.current)
    .slice(0, count);
};

export const getLargestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count);
};

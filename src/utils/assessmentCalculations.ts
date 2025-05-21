
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

export const calculateAverageGap = (categories: Category[]): number => {
  if (!categories || categories.length === 0) {
    console.warn("No categories provided to calculateAverageGap");
    return 0;
  }
  
  let totalSkillCount = 0;
  let totalGapValue = 0;
  
  categories.forEach(category => {
    if (!category.skills || category.skills.length === 0) return;
    
    category.skills.forEach(skill => {
      if (skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number') {
        const current = skill.ratings.current;
        const desired = skill.ratings.desired;
        const gap = Math.abs(desired - current);
        
        totalSkillCount++;
        totalGapValue += gap;
      } else {
        console.warn(`Invalid ratings for skill in calculateAverageGap:`, skill);
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
    if (!category.skills) return;
    
    category.skills.forEach(skill => {
      if (skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number') {
        
        const current = skill.ratings.current;
        const desired = skill.ratings.desired;
        const gap = parseFloat(Math.abs(desired - current).toFixed(2));
        
        result.push({
          ...skill,
          categoryTitle: category.title,
          gap: gap
        });
      } else {
        console.warn(`Skipping skill with invalid ratings in getAllSkillsWithMetadata:`, skill);
      }
    });
  });
  
  return result;
};

export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .filter(skill => skill.ratings && typeof skill.ratings.current === 'number')
    .sort((a, b) => (b.ratings.current || 0) - (a.ratings.current || 0))
    .slice(0, count);
};

export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .filter(skill => skill.ratings && typeof skill.ratings.current === 'number')
    .sort((a, b) => (a.ratings.current || 0) - (b.ratings.current || 0))
    .slice(0, count);
};

export const getLargestGaps = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  if (allSkills.length === 0) return [];
  
  return [...allSkills]
    .filter(skill => skill.ratings && typeof skill.ratings.current === 'number' && typeof skill.ratings.desired === 'number')
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count);
};

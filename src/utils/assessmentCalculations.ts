
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
    return 0;
  }
  
  let totalGap = 0;
  let totalSkills = 0;
  
  categories.forEach(category => {
    if (!category?.skills || category.skills.length === 0) {
      return;
    }
    
    category.skills.forEach(skill => {
      if (skill.ratings && typeof skill.ratings.desired === 'number' && typeof skill.ratings.current === 'number') {
        totalGap += Math.abs(skill.ratings.desired - skill.ratings.current);
        totalSkills++;
      }
    });
  });
  
  if (totalSkills === 0) return 0;
  
  return parseFloat((totalGap / totalSkills).toFixed(2));
};

export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  if (!categories) return [];
  
  return categories.flatMap(category => 
    category.skills.filter(skill => 
      skill.ratings && 
      typeof skill.ratings.desired === 'number' && 
      typeof skill.ratings.current === 'number'
    ).map(skill => ({
      ...skill,
      categoryTitle: category.title,
      gap: parseFloat(Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0)).toFixed(2))
    }))
  );
};

export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  return [...allSkills]
    .filter(skill => typeof skill.ratings.current === 'number')
    .sort((a, b) => (b.ratings.current || 0) - (a.ratings.current || 0))
    .slice(0, count);
};

export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  
  // First sort by gap (largest gap first)
  return [...allSkills]
    .filter(skill => typeof skill.gap === 'number' && skill.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count);
};


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
  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);
  const totalGap = categories.reduce((sum, category) => {
    return sum + category.skills.reduce((catSum, skill) => {
      return catSum + Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0));
    }, 0);
  }, 0);
  
  return parseFloat((totalGap / totalSkills).toFixed(2));
};

export const getAllSkillsWithMetadata = (categories: Category[]): SkillWithMetadata[] => {
  return categories.flatMap(category => 
    category.skills.map(skill => ({
      ...skill,
      categoryTitle: category.title,
      gap: parseFloat(Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0)).toFixed(2))
    }))
  );
};

export const getTopStrengths = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  return [...allSkills]
    .sort((a, b) => (b.ratings.current || 0) - (a.ratings.current || 0))
    .slice(0, count);
};

export const getLowestSkills = (categories: Category[], count: number = 3): SkillWithMetadata[] => {
  const allSkills = getAllSkillsWithMetadata(categories);
  return [...allSkills]
    .sort((a, b) => (a.ratings.current || 0) - (b.ratings.current || 0))
    .slice(0, count);
};

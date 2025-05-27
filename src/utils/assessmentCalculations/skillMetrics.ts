
import { Category } from '../assessmentTypes';

export interface SkillWithMetadata {
  id: string;
  name: string;
  categoryTitle: string;
  ratings: {
    current: number;
    desired: number;
  };
  gap: number;
}

// Get top strengths (skills with highest current ratings)
export const getTopStrengths = (categories: Category[], limit: number = 5): SkillWithMetadata[] => {
  if (!categories || !Array.isArray(categories)) {
    console.error("getTopStrengths received invalid categories:", categories);
    return [];
  }

  const allSkills: SkillWithMetadata[] = [];

  categories.forEach(category => {
    if (!category || !category.skills || !Array.isArray(category.skills)) {
      return;
    }

    category.skills.forEach(skill => {
      if (!skill || !skill.ratings) return;

      const current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : Number(skill.ratings.current || 0);
        
      const desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : Number(skill.ratings.desired || 0);

      // Only include skills with valid current ratings
      if (current > 0) {
        allSkills.push({
          id: skill.id,
          name: skill.name,
          categoryTitle: category.title,
          ratings: { current, desired },
          gap: desired - current
        });
      }
    });
  });

  // Sort by current rating (highest first) and return top skills
  return allSkills
    .sort((a, b) => b.ratings.current - a.ratings.current)
    .slice(0, limit);
};

// Get lowest skills (skills with largest gaps or lowest current ratings)
export const getLowestSkills = (categories: Category[], limit: number = 5): SkillWithMetadata[] => {
  if (!categories || !Array.isArray(categories)) {
    console.error("getLowestSkills received invalid categories:", categories);
    return [];
  }

  const allSkills: SkillWithMetadata[] = [];

  categories.forEach(category => {
    if (!category || !category.skills || !Array.isArray(category.skills)) {
      return;
    }

    category.skills.forEach(skill => {
      if (!skill || !skill.ratings) return;

      const current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : Number(skill.ratings.current || 0);
        
      const desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : Number(skill.ratings.desired || 0);

      // Only include skills with valid ratings
      if (current > 0 || desired > 0) {
        allSkills.push({
          id: skill.id,
          name: skill.name,
          categoryTitle: category.title,
          ratings: { current, desired },
          gap: desired - current
        });
      }
    });
  });

  // Sort by gap (largest first), then by current rating (lowest first)
  return allSkills
    .sort((a, b) => {
      const gapDiff = b.gap - a.gap;
      if (gapDiff !== 0) return gapDiff;
      return a.ratings.current - b.ratings.current;
    })
    .slice(0, limit);
};

// Additional functions to satisfy the index.ts exports
export const getLargestGaps = (categories: Category[], limit: number = 5): SkillWithMetadata[] => {
  return getLowestSkills(categories, limit);
};

export const getSmallestGaps = (categories: Category[], limit: number = 5): SkillWithMetadata[] => {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }

  const allSkills: SkillWithMetadata[] = [];

  categories.forEach(category => {
    if (!category || !category.skills || !Array.isArray(category.skills)) {
      return;
    }

    category.skills.forEach(skill => {
      if (!skill || !skill.ratings) return;

      const current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : Number(skill.ratings.current || 0);
        
      const desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : Number(skill.ratings.desired || 0);

      if (current > 0 || desired > 0) {
        allSkills.push({
          id: skill.id,
          name: skill.name,
          categoryTitle: category.title,
          ratings: { current, desired },
          gap: desired - current
        });
      }
    });
  });

  // Sort by gap (smallest first)
  return allSkills
    .sort((a, b) => a.gap - b.gap)
    .slice(0, limit);
};

export const getSkillsToImprove = (categories: Category[], limit: number = 5): SkillWithMetadata[] => {
  return getLargestGaps(categories, limit);
};

export const getSkillsMeetingExpectations = (categories: Category[], limit: number = 5): SkillWithMetadata[] => {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }

  const allSkills: SkillWithMetadata[] = [];

  categories.forEach(category => {
    if (!category || !category.skills || !Array.isArray(category.skills)) {
      return;
    }

    category.skills.forEach(skill => {
      if (!skill || !skill.ratings) return;

      const current = typeof skill.ratings.current === 'number' 
        ? skill.ratings.current 
        : Number(skill.ratings.current || 0);
        
      const desired = typeof skill.ratings.desired === 'number' 
        ? skill.ratings.desired 
        : Number(skill.ratings.desired || 0);

      // Skills meeting expectations have gap <= 0
      if (current > 0 && desired - current <= 0) {
        allSkills.push({
          id: skill.id,
          name: skill.name,
          categoryTitle: category.title,
          ratings: { current, desired },
          gap: desired - current
        });
      }
    });
  });

  // Sort by current rating (highest first)
  return allSkills
    .sort((a, b) => b.ratings.current - a.ratings.current)
    .slice(0, limit);
};

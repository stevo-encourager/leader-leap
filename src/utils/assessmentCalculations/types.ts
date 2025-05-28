
// Types for assessment calculations
import { Category } from '../assessmentTypes';

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

export interface CategoryWithMetadata {
  id: string;
  title: string;
  description: string;
  gap: number;
  averageRatings: {
    current: number;
    desired: number;
  };
}

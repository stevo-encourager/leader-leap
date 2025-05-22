
/**
 * Core assessment data types
 */

// Re-export the base types from assessmentTypes.ts to maintain consistency
export type { 
  Category, 
  Demographics, 
  Skill, 
  SkillRating,
  AssessmentStep
} from '@/utils/assessmentTypes';

/**
 * Assessment record as stored in the database or retrieved from API
 */
export interface AssessmentRecord {
  id: string;
  created_at: string;
  user_id?: string;
  categories: Category[];
  demographics?: Demographics;
  completed?: boolean;
}

/**
 * Lightweight assessment record for listing purposes
 */
export interface AssessmentSummary {
  id: string;
  created_at: string;
}

/**
 * Local storage assessment data structure
 */
export interface LocalAssessmentData {
  categories: Category[];
  demographics: Demographics;
  timestamp: string;
}

/**
 * Assessment result with calculated metadata
 */
export interface AssessmentWithMetadata extends AssessmentRecord {
  metadata?: {
    averageCurrentRating?: number;
    averageDesiredRating?: number;
    averageGap?: number;
    completedSkillsCount?: number;
    totalSkillsCount?: number;
  };
}

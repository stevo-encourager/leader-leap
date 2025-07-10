
import { Category, Demographics } from '@/utils/assessmentTypes';

export interface AssessmentSummary {
  id: string;
  created_at: string;
  completed?: boolean;
}

export interface LocalAssessmentData {
  categories: Category[];
  demographics: Demographics;
  timestamp: string;
}

export interface AggregatedAssessments {
  [date: string]: AssessmentSummary[];
}

// Export the Category type as AssessmentCategory for compatibility
export type AssessmentCategory = Category;

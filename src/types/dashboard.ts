// Dashboard and results-related type definitions

export interface SkillMetrics {
  currentAverage: number;
  desiredAverage: number;
  averageGap: number;
  skillsAboveExpectation: number;
  skillsBelowExpectation: number;
  largestGaps: Array<{
    name: string;
    current: number;
    desired: number;
    gap: number;
    category: string;
  }>;
  smallestGaps: Array<{
    name: string;
    current: number;
    desired: number;
    gap: number;
    category: string;
  }>;
}

export interface CategoryMetrics {
  [categoryId: string]: {
    title: string;
    currentAverage: number;
    desiredAverage: number;
    averageGap: number;
    skillCount: number;
  };
}

export interface ChartDataPoint {
  name: string;
  current: number;
  desired: number;
  gap: number;
  category: string;
}

export interface InsightSection {
  title: string;
  content: string;
  type: 'strengths' | 'gaps' | 'opportunities' | 'recommendations';
}

export interface AIInsights {
  summary: string;
  keyStrengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  detailedAnalysis: InsightSection[];
}
// Admin-related type definitions

export interface SystemStats {
  totalUsers: number;
  totalAssessments: number;
  assessmentsLast30Days: number;
  activeUsersLast30Days: number;
}

export interface UserData {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  surname?: string;
  is_admin?: boolean;
  created_at: string;
  last_sign_in_at?: string;
  assessment_count?: number;
  receive_emails?: boolean;
  gdpr_consent?: boolean;
}

export interface AnalyticsData {
  timeframe: string;
  totalUsers: number;
  totalAssessments: number;
  assessmentCompletionRate: number;
  averageTimeToComplete: number;
  usersByDemographic: Record<string, number>;
  popularSkillCategories: Array<{
    name: string;
    count: number;
  }>;
}
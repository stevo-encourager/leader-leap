export interface ActionPlanGoal {
  id: string;
  text: string;
  targetDate: string;
  completed: boolean;
}

export interface ActionPlanMilestone {
  id: string;
  text: string;
  targetDate: string;
  completed: boolean;
}

export interface ActionPlanResource {
  id: string;
  type: 'book' | 'framework' | 'tool';
  title: string;
  description?: string;
  url?: string;
  completed: boolean;
  inUse: boolean;
}

export interface QuarterlyMilestones {
  q1: ActionPlanMilestone;
  q2: ActionPlanMilestone;
}

export interface ActionPlan {
  id: string;
  user_id: string;
  assessment_id: string;
  competency_name: string;
  skill_name?: string;
  gap_score: number;
  goals: ActionPlanGoal[];
  quarterly_milestones: QuarterlyMilestones;
  plan_text: string;
  actions_text: string;
  resources: ActionPlanResource[];
  overall_progress: number;
  status: 'active' | 'archived' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ActionPlanFormData {
  competency_name: string;
  skill_name?: string;
  gap_score: number;
  goals: ActionPlanGoal[];
  quarterly_milestones: QuarterlyMilestones;
  plan_text: string;
  actions_text: string;
  resources: ActionPlanResource[];
}

export interface HighGapCompetency {
  title: string;
  gap: number;
  skills: Array<{
    name: string;
    gap: number;
  }>;
} 
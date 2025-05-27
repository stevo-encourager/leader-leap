
// Types for leadership assessment data

export interface SkillRating {
  current: number;
  desired: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  ratings: SkillRating;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
}

export interface Demographics {
  role?: string;
  jobTitle?: string;
  department?: string;
  experienceLevel?: string;
  teamSize?: string;
  yearsOfExperience?: string;
  industry?: string;
}

export type AssessmentStep = 'intro' | 'demographics' | 'assessment' | 'results';

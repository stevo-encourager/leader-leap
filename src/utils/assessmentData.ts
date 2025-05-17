
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
  yearsOfExperience?: string;
  industry?: string;
}

export const initialCategories: Category[] = [
  {
    id: "strategic-thinking",
    title: "Strategic Thinking",
    description: "The ability to develop a clear vision and identify, evaluate and execute strategies.",
    skills: [
      {
        id: "vision-creation",
        name: "Vision Creation",
        description: "Ability to create and articulate a compelling vision for the future.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "analytical-thinking",
        name: "Analytical Thinking",
        description: "Ability to analyze complex problems and identify patterns and insights.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "decision-making",
        name: "Decision Making",
        description: "Ability to make timely and effective decisions based on available information.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "execution",
    title: "Execution",
    description: "The ability to implement strategies and achieve results through effective management.",
    skills: [
      {
        id: "goal-setting",
        name: "Goal Setting",
        description: "Ability to establish clear, meaningful, and achievable objectives.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "resource-management",
        name: "Resource Management",
        description: "Ability to allocate and manage resources efficiently and effectively.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "accountability",
        name: "Accountability",
        description: "Ability to hold yourself and others responsible for performance and results.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "people-leadership",
    title: "People Leadership",
    description: "The ability to inspire, motivate, and develop others to achieve organizational goals.",
    skills: [
      {
        id: "communication",
        name: "Communication",
        description: "Ability to convey information clearly and listen effectively.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "team-building",
        name: "Team Building",
        description: "Ability to develop cohesive and high-performing teams.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "talent-development",
        name: "Talent Development",
        description: "Ability to mentor, coach, and develop people's capabilities.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "self-leadership",
    title: "Self Leadership",
    description: "The ability to lead oneself effectively through self-awareness and continuous growth.",
    skills: [
      {
        id: "self-awareness",
        name: "Self-Awareness",
        description: "Ability to recognize your strengths, weaknesses, emotions, and impact on others.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "learning-agility",
        name: "Learning Agility",
        description: "Ability to learn from experience and apply that learning to new situations.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "resilience",
        name: "Resilience",
        description: "Ability to adapt and thrive in changing circumstances and recover from setbacks.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  }
];

export type AssessmentStep = 'intro' | 'demographics' | 'assessment' | 'results';


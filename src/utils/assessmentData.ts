
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
    title: "Strategic Thinking/Vision",
    description: "The ability to develop a clear vision and identify opportunities for growth and innovation.",
    skills: [
      {
        id: "future-vision",
        name: "Future Vision",
        description: "Ability to envision and articulate a compelling future state for the organization.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "big-picture-thinking",
        name: "Big Picture Thinking",
        description: "Ability to see beyond day-to-day operations and understand broader implications.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "strategic-planning",
        name: "Strategic Planning",
        description: "Ability to create actionable plans that align with the organization's vision.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "communication-skills",
    title: "Communication",
    description: "The ability to effectively convey information and ideas to different audiences.",
    skills: [
      {
        id: "verbal-communication",
        name: "Verbal Communication",
        description: "Ability to express ideas clearly and effectively in spoken form.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "written-communication",
        name: "Written & Visual Communication",
        description: "Ability to communicate ideas clearly, concisely, and persuasively through text and visual presentations.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "active-listening",
        name: "Active Listening",
        description: "Ability to fully focus, understand, respond, and remember what others communicate.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "team-building",
    title: "Team Building/Management",
    description: "The ability to build and maintain high-performing teams through effective leadership.",
    skills: [
      {
        id: "team-motivation",
        name: "Team Motivation",
        description: "Ability to inspire and drive team members toward common goals.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "team-development",
        name: "Team Development",
        description: "Ability to identify and nurture team member strengths and address weaknesses.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "collaboration",
        name: "Collaboration",
        description: "Ability to foster cooperation and effective working relationships.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "decision-making",
    title: "Decision Making",
    description: "The ability to make timely and effective decisions based on available information.",
    skills: [
      {
        id: "critical-thinking",
        name: "Critical Thinking",
        description: "Ability to analyze situations objectively and evaluate options thoroughly.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "problem-solving",
        name: "Problem Solving",
        description: "Ability to identify issues and implement effective solutions.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "decisiveness",
        name: "Decisiveness",
        description: "Ability to make decisions in a timely manner, even with limited information.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "emotional-intelligence",
    title: "Emotional Intelligence",
    description: "The ability to recognize and manage emotions in yourself and others.",
    skills: [
      {
        id: "self-awareness",
        name: "Self-Awareness",
        description: "Ability to recognize your own emotions and their impact on thoughts and behavior.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "empathy",
        name: "Empathy",
        description: "Ability to understand and share the feelings of others.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "relationship-management",
        name: "Relationship Management",
        description: "Ability to develop and maintain healthy professional relationships.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "change-management",
    title: "Change Management",
    description: "The ability to effectively lead and support organizational change initiatives.",
    skills: [
      {
        id: "adaptability",
        name: "Adaptability",
        description: "Ability to adjust to new conditions and embrace change.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "change-leadership",
        name: "Change Leadership",
        description: "Ability to guide teams through transitions and transformations.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "resilience",
        name: "Resilience",
        description: "Ability to recover quickly from difficulties and setbacks.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "conflict-resolution",
    title: "Conflict Resolution",
    description: "The ability to address and resolve disagreements constructively.",
    skills: [
      {
        id: "conflict-management",
        name: "Conflict Management",
        description: "Ability to handle disputes and disagreements effectively.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "negotiation",
        name: "Negotiation",
        description: "Ability to reach agreements that satisfy multiple parties' interests.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "mediation",
        name: "Mediation",
        description: "Ability to facilitate resolution between conflicting parties.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "delegation-empowerment",
    title: "Delegation and Empowerment",
    description: "The ability to effectively assign responsibilities and empower team members.",
    skills: [
      {
        id: "task-delegation",
        name: "Task Delegation",
        description: "Ability to assign work appropriately based on skills and development needs.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "trust-building",
        name: "Trust Building",
        description: "Ability to create an environment of mutual trust and respect.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "autonomy-support",
        name: "Autonomy Support",
        description: "Ability to provide independence while maintaining appropriate oversight.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "time-priority-management",
    title: "Time/Priority Management",
    description: "The ability to manage time effectively and prioritize tasks appropriately.",
    skills: [
      {
        id: "time-management",
        name: "Time Management",
        description: "Ability to use time efficiently and productively.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "prioritization",
        name: "Prioritization",
        description: "Ability to determine which tasks are most important and urgent.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "work-life-balance",
        name: "Work-Life Balance",
        description: "Ability to maintain healthy boundaries between professional and personal life.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  },
  {
    id: "professional-development",
    title: "Professional Development",
    description: "The ability to continuously improve skills and knowledge for career growth.",
    skills: [
      {
        id: "continuous-learning",
        name: "Continuous Learning",
        description: "Ability to seek out and absorb new knowledge and skills.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "feedback-reception",
        name: "Feedback Reception",
        description: "Ability to receive and implement constructive feedback effectively.",
        ratings: { current: 0, desired: 0 }
      },
      {
        id: "career-planning",
        name: "Career Planning",
        description: "Ability to set and work toward meaningful professional goals.",
        ratings: { current: 0, desired: 0 }
      }
    ]
  }
];

export type AssessmentStep = 'intro' | 'demographics' | 'assessment' | 'results';

import { Category } from '../assessmentTypes';

export const selfLeadershipCategory: Category = {
  id: "self-leadership",
  title: "Leading Yourself",
  description: "Your self-awareness, resilience and credibility as a leader.",
  skills: [
    {
      id: "self-awareness",
      name: "Self-Awareness",
      description: "Understands own strengths and blind spots; actively seeks feedback; reflects and adjusts behaviour.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "resilience-composure",
      name: "Resilience & Composure",
      description: "Stays calm under pressure; maintains perspective in setbacks; models positivity for the team.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "executive-presence",
      name: "Executive Presence",
      description: "Commands respect in all forums; communicates with clarity and confidence; credible with senior audiences.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "continuous-learning",
      name: "Continuous Learning",
      description: "Proactively builds knowledge; reads widely; applies new frameworks; invests in own development.",
      ratings: { current: 0, desired: 0 }
    }
  ]
}; 
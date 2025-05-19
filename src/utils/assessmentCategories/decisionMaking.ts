
import { Category } from '../assessmentTypes';

export const decisionMakingCategory: Category = {
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
};

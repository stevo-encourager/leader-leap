
import { Category } from '../assessmentTypes';

export const emotionalIntelligenceCategory: Category = {
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
      description: "Ability to develop and maintain healthy professional relationships, managing up as well as down.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

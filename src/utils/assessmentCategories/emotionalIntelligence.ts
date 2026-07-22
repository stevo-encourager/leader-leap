
import { Category } from '../assessmentTypes';

export const emotionalIntelligenceCategory: Category = {
  id: "emotional-intelligence",
  title: "Emotional Intelligence",
  description: "The ability to recognize and manage emotions in yourself and others.",
  skills: [
    {
      id: "empathy",
      name: "Empathy",
      description: "Reads others' emotions and perspectives accurately; listens deeply; makes people feel genuinely heard.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "trust-building",
      name: "Trust Building",
      description: "Builds trust quickly; earns confidence through consistency and integrity; maintains strong relationships through disagreement and pressure.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "social-awareness",
      name: "Social Awareness",
      description: "Reads the room; senses unspoken dynamics in teams and meetings; adapts approach accordingly.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

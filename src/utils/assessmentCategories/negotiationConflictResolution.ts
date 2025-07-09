
import { Category } from '../assessmentTypes';

export const negotiationConflictResolutionCategory: Category = {
  id: "negotiation-conflict-resolution",
  title: "Negotiation & Conflict Resolution",
  description: "Facilitating challenging conversations and closing successful agreements",
  skills: [
    {
      id: "conflict-resolution",
      name: "Conflict Resolution",
      description: "The ability to transform disputes into productive dialogue and mutually acceptable solutions",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "strategic-negotiation",
      name: "Strategic Negotiation",
      description: "The ability to secure favorable outcomes while building long-term relationships and creating value for all parties",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "facilitation-mediation",
      name: "Facilitation & Mediation",
      description: "The ability to guide complex discussions between multiple stakeholders toward consensus and agreement",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

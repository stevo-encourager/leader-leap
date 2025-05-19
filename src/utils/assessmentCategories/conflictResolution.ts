
import { Category } from '../assessmentTypes';

export const conflictResolutionCategory: Category = {
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
};

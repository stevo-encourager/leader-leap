
import { Category } from '../assessmentTypes';

export const negotiationConflictResolutionCategory: Category = {
  id: "negotiation-conflict-resolution",
  title: "Negotiation & Conflict Resolution",
  description: "Facilitating challenging conversations and closing successful agreements",
  skills: [
    {
      id: "negotiation",
      name: "Negotiation",
      description: "Prepares thoroughly; negotiates from interests, not positions; secures strong outcomes — internally and externally — while preserving relationships.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "conflict-resolution",
      name: "Conflict Resolution",
      description: "Resolves disputes and tensions promptly and fairly; de-escalates; finds outcomes people can commit to.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "difficult-conversations",
      name: "Difficult Conversations",
      description: "Raises sensitive issues directly and constructively; stays composed when challenged.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

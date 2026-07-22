
import { Category } from '../assessmentTypes';

export const influencingCategory: Category = {
  id: "influencing",
  title: "Stakeholder Relationships",
  description: "How you build and manage relationships inside and beyond the business.",
  skills: [
    {
      id: "stakeholder-management",
      name: "Stakeholder Management",
      description: "Manages internal stakeholders up, down and sideways effectively; keeps senior leadership informed; no surprises.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "networking-industry-presence",
      name: "Networking & Industry Presence",
      description: "Builds a strong professional network; visible and credible in their industry; creates opportunities through connections.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "external-relationships",
      name: "External Relationships",
      description: "Builds and maintains key client, partner and market relationships.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

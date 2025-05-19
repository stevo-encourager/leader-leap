
import { Category } from '../assessmentTypes';

export const timeManagementCategory: Category = {
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
};

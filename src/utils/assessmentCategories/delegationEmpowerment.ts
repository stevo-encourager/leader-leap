
import { Category } from '../assessmentTypes';

export const delegationEmpowermentCategory: Category = {
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
};

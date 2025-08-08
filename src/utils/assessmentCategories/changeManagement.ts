
import { Category } from '../assessmentTypes';

export const changeManagementCategory: Category = {
  id: "change-management",
  title: "Change Management",
  description: "The ability to effectively lead and support organisational change initiatives.",
  skills: [
    {
      id: "adaptability",
      name: "Adaptability",
      description: "Ability to adjust to new conditions and embrace change.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "change-leadership",
      name: "Change Leadership",
      description: "Ability to guide teams through transitions and transformations.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "resilience",
      name: "Resilience",
      description: "Ability to recover quickly from difficulties and setbacks.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

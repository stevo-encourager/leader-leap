
import { Category } from '../assessmentTypes';

export const changeManagementCategory: Category = {
  id: "change-management",
  title: "Execution & Operations",
  description: "How well you deliver change, build scalable operations and make sound decisions.",
  skills: [
    {
      id: "leading-change",
      name: "Change Management",
      description: "Plans and lands change effectively; brings people along; manages pace versus due diligence; sustains adoption.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "operational-scaling",
      name: "Operational Scaling",
      description: "Knows what processes, systems and structures a growing organisation needs; puts scalable foundations in place.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "process-governance",
      name: "Process & Governance",
      description: "Champions policies and frameworks; ensures consistent adoption across teams; builds an accountable culture.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

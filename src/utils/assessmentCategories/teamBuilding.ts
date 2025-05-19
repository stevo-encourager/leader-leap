
import { Category } from '../assessmentTypes';

export const teamBuildingCategory: Category = {
  id: "team-building",
  title: "Team Building/Management",
  description: "The ability to build and maintain high-performing teams through effective leadership.",
  skills: [
    {
      id: "team-motivation",
      name: "Team Motivation",
      description: "Ability to inspire and drive team members toward common goals.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "team-development",
      name: "Team Development",
      description: "Ability to identify and nurture team member strengths and address weaknesses.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "collaboration",
      name: "Collaboration",
      description: "Ability to foster cooperation and effective working relationships.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

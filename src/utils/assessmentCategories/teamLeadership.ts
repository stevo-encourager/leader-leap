import { Category } from '../assessmentTypes';

export const teamLeadershipCategory: Category = {
  id: "team-building",
  title: "Leading People",
  description: "How effectively you motivate, develop and get the best from the people around you.",
  skills: [
    {
      id: "people-management",
      name: "People Management",
      description: "Motivates diverse teams; adapts style to different personalities; gives effective feedback; handles underperformance.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "coaching-development",
      name: "Coaching & Development",
      description: "Identifies and grows talent; creates development plans; delegates stretch assignments; invests time in team growth.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "influencing-persuasion",
      name: "Influencing & Persuasion",
      description: "Gains buy-in from peers, upward and cross-functionally; builds coalitions; lands ideas without direct authority.",
      ratings: { current: 0, desired: 0 }
    }
  ]
}; 
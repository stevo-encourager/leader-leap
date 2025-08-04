import { Category } from '../assessmentTypes';

export const selfLeadershipCategory: Category = {
  id: "self-leadership",
  title: "Self-Leadership",
  description: "The ability to continuously improve skills and knowledge for career growth.",
  skills: [
    {
      id: "continuous-learning",
      name: "Continuous Learning",
      description: "Ability to seek out and absorb new knowledge and skills.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "feedback-reception",
      name: "Feedback Reception",
      description: "Ability to receive and implement constructive feedback effectively.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "career-planning",
      name: "Career Planning",
      description: "Ability to set and work toward meaningful professional goals.",
      ratings: { current: 0, desired: 0 }
    }
  ]
}; 
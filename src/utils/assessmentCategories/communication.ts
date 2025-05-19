
import { Category } from '../assessmentTypes';

export const communicationCategory: Category = {
  id: "communication-skills",
  title: "Communication",
  description: "The ability to effectively convey information and ideas to different audiences.",
  skills: [
    {
      id: "verbal-communication",
      name: "Verbal Communication",
      description: "Ability to express ideas clearly and effectively in spoken form.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "written-communication",
      name: "Written & Visual Communication",
      description: "Ability to communicate ideas clearly, concisely, and persuasively through text and visual presentations.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "active-listening",
      name: "Active Listening",
      description: "Ability to fully focus, understand, respond, and remember what others communicate.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};


import { Category } from '../assessmentTypes';

export const influencingCategory: Category = {
  id: "influencing",
  title: "Influencing",
  description: "Connecting with any audience to inform, persuade, and inspire action",
  skills: [
    {
      id: "persuasive-messaging",
      name: "Persuasive Messaging",
      description: "The ability to craft compelling arguments (verbal, written and visual) that motivate others to adopt new perspectives or take specific actions",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "stakeholder-engagement",
      name: "Stakeholder Engagement",
      description: "The ability to identify key decision-makers and tailor communication strategies to gain their support and buy-in",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "executive-presence",
      name: "Executive Presence",
      description: "The ability to project confidence and credibility while delivering messages that inspire trust and drive behavioral change",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

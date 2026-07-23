
import { Category } from '../assessmentTypes';

export const timeManagementCategory: Category = {
  id: "time-priority-management",
  title: "Personal Effectiveness",
  description: "How you organise and focus your time, attention and energy on what matters most.",
  skills: [
    {
      id: "prioritisation",
      name: "Prioritisation",
      description: "Focuses on the vital few over the trivial many; says no well; aligns time with what matters most.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "focus-deep-work",
      name: "Focus & Deep Work",
      description: "Protects time for substantive thinking; manages interruptions; avoids being permanently reactive.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "sustainable-pace",
      name: "Sustainable Pace",
      description: "Maintains work-life balance; manages own energy; models healthy working patterns for the team.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};


import { Category } from '../assessmentTypes';

export const delegationEmpowermentCategory: Category = {
  id: "delegation-empowerment",
  title: "Delegation & Empowerment",
  description: "The ability to effectively assign responsibilities and empower team members.",
  skills: [
    {
      id: "working-through-others",
      name: "Working Through Others",
      description: "Gets results through others; gives the right work to the right people with clear outcomes; resists doing it all themselves.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "empowerment-autonomy",
      name: "Empowerment & Autonomy",
      description: "Gives people genuine ownership; creates space for others to lead, decide and grow.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "accountability",
      name: "Accountability Without Micromanaging",
      description: "Sets clear expectations and follows up appropriately; trusts people to deliver without hovering.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

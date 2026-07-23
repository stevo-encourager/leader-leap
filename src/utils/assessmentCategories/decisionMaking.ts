
import { Category } from '../assessmentTypes';

export const decisionMakingCategory: Category = {
  id: "decision-making",
  title: "Decision Making",
  description: "The ability to make timely and effective decisions based on available information.",
  skills: [
    {
      id: "sound-judgement",
      name: "Sound Judgement",
      description: "Makes timely, well-reasoned decisions under uncertainty; knows when to escalate; balances speed with rigour.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "data-driven-decisions",
      name: "Data-Driven Decision Making",
      description: "Uses data to inform decisions and track performance; comfortable with KPIs and dashboards; draws actionable insights rather than relying on instinct alone.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "risk-assessment",
      name: "Risk Assessment",
      description: "Weighs risk and reward systematically; anticipates second-order consequences; knows which risks are worth taking.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};

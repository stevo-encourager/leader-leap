
import { Category } from '../assessmentTypes';

export const strategicThinkingCategory: Category = {
  id: "strategic-thinking",
  title: "Strategy & Commercial",
  description: "Your ability to set direction and make commercially sound decisions.",
  skills: [
    {
      id: "strategic-direction",
      name: "Strategic Thinking",
      description: "Sets clear direction; looks beyond the immediate horizon; identifies market opportunities and risks; translates vision into priorities.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "commercial-acumen",
      name: "Commercial Acumen",
      description: "Understands P&L drivers, margins and pricing; makes data-informed commercial decisions; understands customer value.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "financial-literacy",
      name: "Financial Literacy",
      description: "Reads and interprets balance sheets, cash flow and management accounts; can interrogate financial performance.",
      ratings: { current: 0, desired: 0 }
    },
    {
      id: "growth-leadership",
      name: "Growth Leadership",
      description: "Sets ambitious targets; understands what drives revenue and growth; challenges and supports others to deliver commercial results.",
      ratings: { current: 0, desired: 0 }
    }
  ]
};


import { strategicThinkingCategory } from './strategicThinking';
import { influencingCategory } from './influencing';
import { teamLeadershipCategory } from './teamLeadership';
import { decisionMakingCategory } from './decisionMaking';
import { emotionalIntelligenceCategory } from './emotionalIntelligence';
import { changeManagementCategory } from './changeManagement';
import { negotiationConflictResolutionCategory } from './negotiationConflictResolution';
import { delegationEmpowermentCategory } from './delegationEmpowerment';
import { timeManagementCategory } from './timeManagement';
import { selfLeadershipCategory } from './selfLeadership';
import { Category } from '../assessmentTypes';

// This array order is the order categories are presented in the assessment,
// results and PDF export.
export const allCategories = [
  selfLeadershipCategory,                 // Leading Yourself
  emotionalIntelligenceCategory,          // Emotional Intelligence
  timeManagementCategory,                 // Personal Effectiveness
  teamLeadershipCategory,                 // Leading People
  delegationEmpowermentCategory,          // Delegation & Empowerment
  negotiationConflictResolutionCategory,  // Negotiation & Conflict Resolution
  influencingCategory,                    // Stakeholder Relationships
  strategicThinkingCategory,              // Strategy & Commercial
  decisionMakingCategory,                 // Decision Making
  changeManagementCategory                // Execution & Operations
];

export {
  strategicThinkingCategory,
  influencingCategory,
  teamLeadershipCategory,
  decisionMakingCategory,
  emotionalIntelligenceCategory,
  changeManagementCategory,
  negotiationConflictResolutionCategory,
  delegationEmpowermentCategory,
  timeManagementCategory,
  selfLeadershipCategory
};

// Using export type for type re-export
export type { Category };

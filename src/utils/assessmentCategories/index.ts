
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

export const allCategories = [
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

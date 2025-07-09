
import { strategicThinkingCategory } from './strategicThinking';
import { influencingCategory } from './influencing';
import { teamBuildingCategory } from './teamBuilding';
import { decisionMakingCategory } from './decisionMaking';
import { emotionalIntelligenceCategory } from './emotionalIntelligence';
import { changeManagementCategory } from './changeManagement';
import { negotiationConflictResolutionCategory } from './negotiationConflictResolution';
import { delegationEmpowermentCategory } from './delegationEmpowerment';
import { timeManagementCategory } from './timeManagement';
import { professionalDevelopmentCategory } from './professionalDevelopment';
import { Category } from '../assessmentTypes';

export const allCategories = [
  strategicThinkingCategory,
  influencingCategory,
  teamBuildingCategory,
  decisionMakingCategory,
  emotionalIntelligenceCategory,
  changeManagementCategory,
  negotiationConflictResolutionCategory,
  delegationEmpowermentCategory,
  timeManagementCategory,
  professionalDevelopmentCategory
];

export {
  strategicThinkingCategory,
  influencingCategory,
  teamBuildingCategory,
  decisionMakingCategory,
  emotionalIntelligenceCategory,
  changeManagementCategory,
  negotiationConflictResolutionCategory,
  delegationEmpowermentCategory,
  timeManagementCategory,
  professionalDevelopmentCategory
};

// Using export type for type re-export
export type { Category };

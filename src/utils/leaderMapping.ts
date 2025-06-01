
import { LEADER_RESOURCES } from './resources/leaders';
import { ResourceMapping } from './resourceMapping';

/**
 * Normalize leader name for mapping lookup
 */
function normalizeLeaderName(leaderName: string): string {
  return leaderName.toLowerCase()
    .replace(/['"'"]/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Find the validated leader mapping for a given leader name
 */
export function findLeaderMapping(leaderName: string): ResourceMapping | null {
  const normalized = normalizeLeaderName(leaderName);
  
  // Direct match
  if (LEADER_RESOURCES[normalized]) {
    return LEADER_RESOURCES[normalized];
  }
  
  // Partial match - find if the leader name contains any known leader
  for (const [key, mapping] of Object.entries(LEADER_RESOURCES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Generate a validated leader link with proper formatting
 */
export function generateLeaderLink(leaderName: string): {
  name: string;
  url: string | null;
  hasValidLink: boolean;
} {
  // Try to find a mapping
  const mapping = findLeaderMapping(leaderName);
  if (mapping) {
    return {
      name: mapping.title,
      url: mapping.url,
      hasValidLink: true
    };
  }
  
  // No mapping found - return without link
  return {
    name: leaderName,
    url: null,
    hasValidLink: false
  };
}

/**
 * Get all available validated leaders
 */
export function getValidatedLeaders(): string[] {
  return Object.values(LEADER_RESOURCES).map(leader => leader.title);
}

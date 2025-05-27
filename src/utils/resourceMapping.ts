
/**
 * Mapping of well-known leadership resources to their public URLs
 */

export interface ResourceMapping {
  title: string;
  url: string;
  type: 'book' | 'article' | 'course' | 'framework' | 'tool';
}

// Import the combined resource mappings
import { ALL_RESOURCE_MAPPINGS } from './resources';

// Use the imported mappings
export const RESOURCE_MAPPINGS: Record<string, ResourceMapping> = ALL_RESOURCE_MAPPINGS;

/**
 * Normalize resource text for mapping lookup
 */
function normalizeResourceText(resource: string): string {
  return resource.toLowerCase()
    .replace(/['"'"]/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Find the best matching resource mapping for a given resource text
 */
export function findResourceMapping(resource: string): ResourceMapping | null {
  const normalized = normalizeResourceText(resource);
  
  // Direct match
  if (RESOURCE_MAPPINGS[normalized]) {
    return RESOURCE_MAPPINGS[normalized];
  }
  
  // Partial match - find if the resource contains any known resource
  for (const [key, mapping] of Object.entries(RESOURCE_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Generate a resource link with proper formatting and fallback
 */
export function generateResourceLink(resource: string): {
  title: string;
  url: string | null;
  hasValidLink: boolean;
} {
  // Check if it's already a URL
  if (resource.startsWith('http')) {
    return {
      title: resource,
      url: resource,
      hasValidLink: true
    };
  }
  
  // Try to find a mapping
  const mapping = findResourceMapping(resource);
  if (mapping) {
    return {
      title: mapping.title,
      url: mapping.url,
      hasValidLink: true
    };
  }
  
  // No mapping found - return without link
  return {
    title: resource,
    url: null,
    hasValidLink: false
  };
}

export default { RESOURCE_MAPPINGS, findResourceMapping, generateResourceLink };

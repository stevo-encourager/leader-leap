import { ResourceMapping } from '../resourceMapping';
import { BOOK_RESOURCES } from './books';
import { FRAMEWORK_RESOURCES } from './frameworks';
import { COURSE_RESOURCES } from './courses';
import { TOOL_RESOURCES } from './tools';
import { LEADERSHIP_FRAMEWORK_RESOURCES } from './leadership-frameworks';
import { PROFESSIONAL_DEVELOPMENT_RESOURCES } from './professional-development';
import { TEAM_LEADERSHIP_RESOURCES } from './team-leadership';

/**
 * Combined mapping of all leadership resources
 */
export const ALL_RESOURCE_MAPPINGS: Record<string, ResourceMapping> = {
  ...BOOK_RESOURCES,
  ...FRAMEWORK_RESOURCES,
  ...COURSE_RESOURCES,
  ...TOOL_RESOURCES,
  ...LEADERSHIP_FRAMEWORK_RESOURCES,
  ...PROFESSIONAL_DEVELOPMENT_RESOURCES,
  ...TEAM_LEADERSHIP_RESOURCES
};

// Export individual mappings for specific use cases
export {
  BOOK_RESOURCES,
  FRAMEWORK_RESOURCES,
  COURSE_RESOURCES,
  TOOL_RESOURCES,
  LEADERSHIP_FRAMEWORK_RESOURCES,
  PROFESSIONAL_DEVELOPMENT_RESOURCES,
  TEAM_LEADERSHIP_RESOURCES
};

/**
 * Get resources by type
 */
export const getResourcesByType = (type: ResourceMapping['type']): Record<string, ResourceMapping> => {
  return Object.fromEntries(
    Object.entries(ALL_RESOURCE_MAPPINGS).filter(([, resource]) => resource.type === type)
  );
};

/**
 * Get all resource types
 */
export const getResourceTypes = (): ResourceMapping['type'][] => {
  return ['book', 'article', 'course', 'framework', 'tool'];
};

/**
 * Add a new resource mapping (for easy maintenance)
 */
export const addResourceMapping = (key: string, resource: ResourceMapping): void => {
  ALL_RESOURCE_MAPPINGS[key] = resource;
};

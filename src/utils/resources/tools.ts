
import { ResourceMapping } from '../resourceMapping';

export const TOOL_RESOURCES: Record<string, ResourceMapping> = {
  // Strengths Assessment
  'strengthsfinder 2.0': {
    title: 'StrengthsFinder 2.0',
    url: 'https://www.gallup.com/cliftonstrengths',
    type: 'tool'
  },
  'cliftonstrengths': {
    title: 'StrengthsFinder 2.0',
    url: 'https://www.gallup.com/cliftonstrengths',
    type: 'tool'
  },

  // Behavioral Assessment
  'the predictive index': {
    title: 'The Predictive Index',
    url: 'https://www.predictiveindex.com/',
    type: 'tool'
  },
  'predictive index': {
    title: 'The Predictive Index',
    url: 'https://www.predictiveindex.com/',
    type: 'tool'
  }
};

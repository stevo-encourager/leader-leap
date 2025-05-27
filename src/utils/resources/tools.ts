
import { ResourceMapping } from '../resourceMapping';

export const TOOL_RESOURCES: Record<string, ResourceMapping> = {
  // Personality and Behavioral Assessments
  'disc assessment': {
    title: 'DISC Assessment',
    url: 'https://www.discprofile.com/',
    type: 'tool'
  },
  'mbti assessment': {
    title: 'Myers-Briggs Type Indicator (MBTI)',
    url: 'https://www.myersbriggs.org/',
    type: 'tool'
  },

  // Strengths Assessment
  'strengths finder 2.0': {
    title: 'StrengthsFinder 2.0',
    url: 'https://www.gallup.com/cliftonstrengths/en/253715/34-cliftonstrengths-themes.aspx',
    type: 'tool'
  }
};

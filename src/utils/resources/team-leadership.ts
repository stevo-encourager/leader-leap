
import { ResourceMapping } from '../resourceMapping';

export const TEAM_LEADERSHIP_RESOURCES: Record<string, ResourceMapping> = {
  // Team Development
  'forming storming norming performing': {
    title: "Tuckman's Team Development Model",
    url: 'https://www.mindtools.com/pages/article/newLDR_86.htm',
    type: 'framework'
  },
  'team charter': {
    title: 'Creating Effective Team Charters',
    url: 'https://hbr.org/2016/05/to-build-a-great-team-start-with-a-team-charter',
    type: 'framework'
  },
  'psychological safety': {
    title: 'Psychological Safety in Teams',
    url: 'https://rework.withgoogle.com/blog/five-keys-to-a-successful-google-team/',
    type: 'framework'
  },

  // Team Communication
  'team communication': {
    title: 'Effective Team Communication Strategies',
    url: 'https://hbr.org/2016/11/how-to-build-a-culture-of-originality',
    type: 'framework'
  },
  'meeting facilitation': {
    title: 'Meeting Facilitation Best Practices',
    url: 'https://hbr.org/2015/03/how-to-design-meetings-your-team-actually-wants-to-attend',
    type: 'framework'
  },

  // Motivation & Engagement
  'motivation theory': {
    title: 'Self-Determination Theory',
    url: 'https://selfdeterminationtheory.org/the-theory/',
    type: 'framework'
  },
  'employee engagement': {
    title: 'Employee Engagement Best Practices',
    url: 'https://www.gallup.com/workplace/285674/improve-employee-engagement-workplace.aspx',
    type: 'framework'
  },

  // Diversity & Inclusion
  'inclusive leadership': {
    title: 'Inclusive Leadership Framework',
    url: 'https://www2.deloitte.com/us/en/insights/topics/talent/six-signature-traits-of-inclusive-leadership.html',
    type: 'framework'
  },
  'unconscious bias': {
    title: 'Understanding Unconscious Bias',
    url: 'https://www.catalyst.org/research/interrupting-bias-calling-out-vs-calling-in/',
    type: 'framework'
  }
};

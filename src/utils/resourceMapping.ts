
/**
 * Mapping of well-known leadership resources to their public URLs
 */

export interface ResourceMapping {
  title: string;
  url: string;
  type: 'book' | 'article' | 'course' | 'framework' | 'tool';
}

// Comprehensive mapping of leadership resources to real URLs
export const RESOURCE_MAPPINGS: Record<string, ResourceMapping> = {
  // Books
  'emotional intelligence 2.0 by travis bradberry': {
    title: 'Emotional Intelligence 2.0 by Travis Bradberry',
    url: 'https://www.amazon.com/Emotional-Intelligence-2-0-Travis-Bradberry/dp/0974320625',
    type: 'book'
  },
  'emotional intelligence 2.0': {
    title: 'Emotional Intelligence 2.0 by Travis Bradberry',
    url: 'https://www.amazon.com/Emotional-Intelligence-2-0-Travis-Bradberry/dp/0974320625',
    type: 'book'
  },
  'crucial conversations': {
    title: 'Crucial Conversations by Kerry Patterson',
    url: 'https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/1469266822',
    type: 'book'
  },
  'crucial conversations by kerry patterson': {
    title: 'Crucial Conversations by Kerry Patterson',
    url: 'https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/1469266822',
    type: 'book'
  },
  'crucial conversations training program': {
    title: 'Crucial Conversations Training',
    url: 'https://www.vitalsmarts.com/crucial-conversations-training/',
    type: 'course'
  },
  'the 7 habits of highly effective people': {
    title: 'The 7 Habits of Highly Effective People by Stephen Covey',
    url: 'https://www.amazon.com/Habits-Highly-Effective-People-Powerful/dp/1982137274',
    type: 'book'
  },
  'good to great by jim collins': {
    title: 'Good to Great by Jim Collins',
    url: 'https://www.amazon.com/Good-Great-Some-Companies-Others/dp/0066620996',
    type: 'book'
  },
  'good to great': {
    title: 'Good to Great by Jim Collins',
    url: 'https://www.amazon.com/Good-Great-Some-Companies-Others/dp/0066620996',
    type: 'book'
  },
  'dare to lead by brené brown': {
    title: 'Dare to Lead by Brené Brown',
    url: 'https://www.amazon.com/Dare-Lead-Brave-Conversations-Hearts/dp/0399592520',
    type: 'book'
  },
  'dare to lead': {
    title: 'Dare to Lead by Brené Brown',
    url: 'https://www.amazon.com/Dare-Lead-Brave-Conversations-Hearts/dp/0399592520',
    type: 'book'
  },
  'the leadership challenge': {
    title: 'The Leadership Challenge by James Kouzes',
    url: 'https://www.amazon.com/Leadership-Challenge-Extraordinary-Things-Organizations/dp/1119278965',
    type: 'book'
  },
  'primal leadership': {
    title: 'Primal Leadership by Daniel Goleman',
    url: 'https://www.amazon.com/Primal-Leadership-Realizing-Emotional-Intelligence/dp/1591391845',
    type: 'book'
  },

  // Frameworks and Models
  'adkar model': {
    title: 'ADKAR Change Management Model',
    url: 'https://www.prosci.com/methodology/adkar',
    type: 'framework'
  },
  'adkar change management model': {
    title: 'ADKAR Change Management Model',
    url: 'https://www.prosci.com/methodology/adkar',
    type: 'framework'
  },
  'kotter 8-step process': {
    title: "Kotter's 8-Step Change Process",
    url: 'https://www.kotterinc.com/8-steps-process-for-leading-change/',
    type: 'framework'
  },
  'situational leadership model': {
    title: 'Situational Leadership Model',
    url: 'https://www.kenblanchard.com/Products-Services/Situational-Leadership-II',
    type: 'framework'
  },
  'disc assessment': {
    title: 'DISC Assessment',
    url: 'https://www.discprofile.com/',
    type: 'tool'
  },
  'strengths finder 2.0': {
    title: 'StrengthsFinder 2.0',
    url: 'https://www.gallup.com/cliftonstrengths/en/253715/34-cliftonstrengths-themes.aspx',
    type: 'tool'
  },
  'mbti assessment': {
    title: 'Myers-Briggs Type Indicator (MBTI)',
    url: 'https://www.myersbriggs.org/',
    type: 'tool'
  },

  // Courses and Training
  'crucial accountability training': {
    title: 'Crucial Accountability Training',
    url: 'https://www.vitalsmarts.com/crucial-accountability-training/',
    type: 'course'
  },
  'emotional intelligence training': {
    title: 'Emotional Intelligence Training',
    url: 'https://www.ei-institute.com/',
    type: 'course'
  },
  'harvard business review leadership courses': {
    title: 'Harvard Business Review Leadership Courses',
    url: 'https://hbr.org/topic/leadership',
    type: 'course'
  },
  'center for creative leadership': {
    title: 'Center for Creative Leadership',
    url: 'https://www.ccl.org/',
    type: 'course'
  }
};

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

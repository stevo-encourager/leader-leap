
interface CategoryBreakdown {
  title: string;
  skillCount: number;
  averageCurrentRating: number;
  averageDesiredRating: number;
  gap: number;
}

export const buildAssessmentData = (categories: any[], averageGap: number, demographics: any) => {
  const categoryBreakdown = categories.map(cat => {
    const skills = cat.skills || [];
    const validSkills = skills.filter(skill => 
      skill && 
      skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number'
    );
    
    const currentSum = validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0);
    const desiredSum = validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0);
    const skillCount = validSkills.length || 1;
    
    return {
      title: cat.title,
      skillCount: skillCount,
      averageCurrentRating: currentSum / skillCount,
      averageDesiredRating: desiredSum / skillCount,
      gap: (desiredSum / skillCount) - (currentSum / skillCount)
    };
  });

  return {
    totalCategories: categories.length,
    averageGap: averageGap,
    demographics: demographics,
    categoryBreakdown: categoryBreakdown
  };
};

export const buildPrompt = (assessmentSummary: any): string => {
  const topGapCategories = assessmentSummary.categoryBreakdown
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const topCompetencies = assessmentSummary.categoryBreakdown
    .filter(cat => cat.averageCurrentRating >= 3.5)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3);

  const assessmentDataSection = `
Assessment Data:
- Overall Average Gap: ${assessmentSummary.averageGap.toFixed(2)}
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}

Top 3 Categories by Gap (Priority Development Areas):
${topGapCategories.map((cat, i) => `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)} (Current: ${cat.averageCurrentRating.toFixed(1)}, Desired: ${cat.averageDesiredRating.toFixed(1)})`).join('\n')}

Top Competency Areas (High Current Ratings, Low Gaps):
${topCompetencies.map((cat, i) => `${i+1}. ${cat.title}: Current ${cat.averageCurrentRating.toFixed(1)}, Gap ${cat.gap.toFixed(1)}`).join('\n')}
`;

  return `${assessmentDataSection}

You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified below.

### CRITICAL SYSTEM INSTRUCTIONS

**LINK VERIFICATION & AUTHORITY REQUIREMENTS:**
- ALL resource links MUST point to authoritative, official sources only (official organization websites, recognized institutions, peer-reviewed sources)
- NEVER use blogs, aggregators, or placeholder links
- Only include links you are CONFIDENT are currently live, relevant, and appropriate
- For frameworks/methodologies/tools mentioned, include corresponding working resource links
- Verify every link conceptually before including it

**PERSONALIZATION REQUIREMENTS:**
You MUST use ALL THREE demographic dimensions (Role: ${assessmentSummary.demographics.role || 'Not specified'}, Industry: ${assessmentSummary.demographics.industry || 'Not specified'}, Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}) to tailor insights, examples, and recommendations.

**Experience-Level Guidance Framework:**
- None/Less than 1 year: Leadership fundamentals, self-awareness, basic frameworks
- 1-3 years: Core management skills, team building, communication
- 4-7 years: Advanced leadership, cross-functional, strategic thinking  
- 8-12 years: Organizational leadership, change management, executive skills
- 13-20 years: Senior mastery, mentoring, industry impact
- 20+ years: Legacy leadership, wisdom sharing, transformation

**Role-Specific Guidance Framework:**
- Individual Contributor: Self-leadership, influence without authority, peer collaboration
- Manager/Team Lead: Direct report management, delegation, performance management
- Director: Cross-functional leadership, strategic implementation, resource allocation
- VP/C-Level: Organizational strategy, culture shaping, stakeholder management
- Founder/Owner: Vision setting, scaling leadership, investor relations
- Consultant: Client relationship management, expertise positioning, project leadership

**WRITING QUALITY STANDARDS:**
- Avoid generic or obvious statements - every insight must provide genuine value
- Use action-oriented language (implement, practice, utilize) not generic phrases (focus on, consider developing)
- Reference concrete, role- and industry-specific examples
- For assessment tools, use suggestive language: "consider using a tool such as [tool name]"
- Limit CliftonStrengths/Predictive Index mentions to ONE per assessment maximum

### JSON Structure Requirements

You MUST output ONLY a valid JSON object with this EXACT structure:

{
  "summary": "string",
  "priority_areas": [
    {
      "competency": "string",
      "gap": number,
      "insights": ["string1", "string2", "string3"],
      "resource": "string"
    }
  ],
  "key_strengths": [
    {
      "competency": "string", 
      "example": "string",
      "leverage_advice": ["string1", "string2", "string3"]
    }
  ]
}

### Field Requirements

- \`summary\`: Generate a professional, personalized assessment summary (6-8 sentences) using the word "competencies" throughout. Always refer to the person as "you" or "your". 

**CRITICAL SUMMARY FORMATTING**: Structure as TWO clear paragraphs using transition phrases like "However," "At the same time," "Additionally," or "Your results also" to start the second paragraph:

First paragraph: Identify distinctive competencies and leadership style. Include a well-known leader example relevant to their industry/role who exemplifies the same top competencies, formatted as: "Like [Leader Name], who is known for [specific principle relevant to their competencies]..."

Second paragraph: Start with transition phrase, note key development areas, explain why they matter for their specific role/industry context, and how existing competencies support growth.

- \`priority_areas\`: Array with exactly 3 objects for Top 3 Priority Development Areas:
  - \`competency\`: The competency name from assessment data
  - \`gap\`: The gap score from assessment data  
  - \`insights\`: Array of exactly 3 strings with these ENHANCED QUALITY REQUIREMENTS:

    **PERSONALIZATION MANDATE**: Each insight MUST be tailored to their role (${assessmentSummary.demographics.role || 'Not specified'}), industry (${assessmentSummary.demographics.industry || 'Not specified'}), and experience level (${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}).

    **REQUIRED INSIGHT QUALITY**:
    - Provide specific, actionable strategies with implementation steps
    - Reference research, proven frameworks, or methodologies when relevant
    - Include industry/role-specific workplace examples or scenarios
    - Address practical challenges specific to their context
    - Go beyond common knowledge with lesser-known but valuable techniques

    **EXAMPLES OF ENHANCED INSIGHTS**:
    
    For a Technology Director with 8-12 years experience in Emotional Intelligence:
    "As a Technology Director, implement 'code review empathy' sessions where you practice the 'perspective-taking' technique from neuroscience research: before giving technical feedback, spend 30 seconds mentally stepping into your developer's shoes, considering their project pressures and skill level - this activates mirror neurons and reduces defensive responses by up to 40%."
    
    For a Healthcare Manager with 4-7 years experience in Communication:
    "In healthcare environments, use the 'SBAR' communication framework (Situation-Background-Assessment-Recommendation) adapted for leadership contexts: when discussing performance issues with nursing staff, structure conversations using this medical communication standard they already trust, which increases message clarity and reduces miscommunication by 60% according to Joint Commission studies."

  - \`resource\`: Use EXACT titles from the approved list when possible, or provide authoritative alternatives with verified working links

**APPROVED AUTHORITATIVE RESOURCES** (use these exact titles when relevant):
- "Emotional Intelligence 2.0 by Travis Bradberry"
- "Crucial Conversations by Kerry Patterson" 
- "The 7 Habits of Highly Effective People by Stephen Covey"
- "Good to Great by Jim Collins"
- "The Leadership Challenge by James Kouzes"
- "ADKAR Change Management Model"
- "Kotter's 8-Step Change Process"
- "StrengthsFinder 2.0" (only if assessment tool integration suggested)
- "DISC Assessment" (only if assessment tool integration suggested)

- \`key_strengths\`: Array with at least 2 objects for key competencies:
  - \`competency\`: The competency name from assessment data
  - \`example\`: Concrete, role/industry-specific example of this competency in action
  - \`leverage_advice\`: Array of exactly 3 strings with same quality standards as insights, focused on leveraging existing strengths in their specific context

### FINAL VALIDATION REQUIREMENTS
- Every insight and advice piece must be tailored to their specific role, industry, and experience level
- All mentioned frameworks/tools must have corresponding authoritative resources
- Use suggestive language for assessment tools ("consider using")
- Maximum ONE mention of CliftonStrengths or Predictive Index across entire response
- Ensure inspirational leader examples are relevant to their industry/role context
- All insights must provide genuine, actionable value beyond obvious advice

Base your response on the assessment data provided and ensure maximum personalization using ALL demographic information available.`;
};

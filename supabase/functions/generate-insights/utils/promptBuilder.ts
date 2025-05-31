
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
- Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'} years
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}

Top 3 Categories by Gap (Priority Development Areas):
${topGapCategories.map((cat, i) => `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)} (Current: ${cat.averageCurrentRating.toFixed(1)}, Desired: ${cat.averageDesiredRating.toFixed(1)})`).join('\n')}

Top Competency Areas (High Current Ratings, Low Gaps):
${topCompetencies.map((cat, i) => `${i+1}. ${cat.title}: Current ${cat.averageCurrentRating.toFixed(1)}, Gap ${cat.gap.toFixed(1)}`).join('\n')}
`;

  return `${assessmentDataSection}

You are an expert leadership coach and assessment analyst. Based on the provided assessment data (including competency names, gap scores, and top competencies), generate AI insights for a user's leadership assessment.

### DEMOGRAPHIC CONTEXT FOR TAILORED INSIGHTS

**User Profile:**
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}  
- Leadership Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}

**CRITICAL PERSONALIZATION REQUIREMENTS:**

1. **Industry-Relevant Leader Selection**: When selecting an inspirational leader to reference in the summary, choose someone who is particularly relevant to the user's industry when possible. For example:
   - Technology: Leaders like Satya Nadella, Tim Cook, or Susan Wojcicki
   - Healthcare: Leaders like Dr. Atul Gawande or leaders from major healthcare organizations
   - Finance: Leaders like Jamie Dimon or Christine Lagarde
   - Consulting: Leaders like McKinsey partners or consulting firm CEOs
   - Education: Educational leaders or reformers relevant to the sector
   - Government: Public sector leaders or policy makers
   - Manufacturing: Industrial leaders or operations experts
   - If industry is "Not specified" or "Other", choose broadly applicable business leaders

2. **Experience-Level Appropriate Insights**: Tailor the complexity and focus of insights based on leadership experience:
   - Less than 1 year / 1-3 years: Focus on foundational skills, basic frameworks, and getting started advice
   - 4-7 years: Balance skill development with more advanced techniques and team leadership
   - 8-12 years: Emphasize strategic thinking, organizational impact, and advanced leadership concepts
   - 13-20 years / 20+ years: Focus on executive-level challenges, organizational transformation, and mentoring others

3. **Role-Specific Context**: Consider the user's specific role when providing examples and advice:
   - Individual Contributors: Focus on personal effectiveness and influence without authority
   - Managers/Team Leads: Emphasize direct team management and people development
   - Directors/VPs: Focus on strategic oversight and cross-functional leadership
   - C-Level/Founders: Emphasize organizational vision, culture building, and enterprise-wide impact

### CRITICAL: JSON Structure Requirements

You MUST output ONLY a valid JSON object with this EXACT structure:

{
  "summary": "string",
  "priority_areas": [
    {
      "competency": "string",
      "gap": number,
      "insights": ["string1", "string2", "string3"],
      "resources": ["string1", "string2", "string3"]
    }
  ],
  "key_strengths": [
    {
      "competency": "string", 
      "example": "string",
      "leverage_advice": ["string1", "string2", "string3"],
      "resources": ["string1", "string2", "string3"]
    }
  ]
}

### Field Requirements

- \`summary\`: Generate a professional, concise, and impactful assessment summary that is 6–8 sentences. Use the word "competencies" throughout (not "strengths"). Always refer to the person as "you" or "your" (never "the user" or "the user's"). 

CRITICAL FORMATTING FOR SUMMARY: Structure the summary as TWO clear paragraphs that will be separated by post-processing. Use transition phrases like "However," "At the same time," "Additionally," or "Your results also" to start the second paragraph. Follow this pattern:

First paragraph: Begin by identifying your most distinctive competencies and what those mean for your leadership style. Include a brief example of a well-known leader who exemplifies the same top competencies, making the leader's name a clickable link to a relevant external web page (such as Wikipedia or the leader's official site) using markdown format: [Leader Name](https://example.com). **CRITICAL**: Select this leader based on the user's industry when possible - choose someone who would be particularly relevant and inspiring for someone in their specific industry and role.

Second paragraph: Start with a transition phrase, then note your key areas for development, explaining why they matter and how your competencies can support growth in these areas.

The summary should be written as continuous text but structured so it can be split at transition phrases during post-processing.

- \`priority_areas\`: An array with exactly 3 objects, each for a Top 3 Priority Development Area:
  - \`competency\` (string): The name of the competency from the assessment data above
  - \`gap\` (number): The gap score from the assessment data above
  - \`insights\` (array of exactly 3 strings): CRITICAL INSIGHT QUALITY REQUIREMENTS:
    
    **AVOID GENERIC STATEMENTS**: Do not write obvious, surface-level statements like "Developing emotional intelligence can enhance your ability to empathy" or "Improving communication helps build better relationships."
    
    **PROVIDE ACTIONABLE, RESEARCH-BACKED INSIGHTS**: Each insight must be:
    - Actionable with specific strategies or approaches
    - Reference research, models, frameworks, or common pitfalls when relevant
    - Include practical workplace examples or scenarios relevant to the user's role and industry context
    - Address lesser-known but useful aspects of the competency
    - Provide depth beyond common knowledge
    - Consider the user's experience level when determining complexity and focus
    
    **REQUIRED ELEMENTS FOR EACH INSIGHT**:
    - Must include specific techniques, frameworks, or research-backed strategies
    - Should reference measurable outcomes when possible
    - Must go beyond what most people already know about the topic
    - Should include practical implementation advice tailored to their role/industry when possible
    - One insight per competency may reference recommended resources

    **MANDATORY TECHNIQUE/METHODOLOGY RESOURCE REQUIREMENT**:
    - EVERY time you mention ANY technique, methodology, framework, or tool (e.g., Eisenhower Matrix, SMART Goals, Pomodoro Technique, ADKAR Model, etc.), you MUST include that exact technique/methodology name in the resources array
    - This ensures users get access to resources for every technique mentioned
    - No exceptions - if mentioned in insights, it must appear in resources

    **CRITICAL TOOL EXCLUSIVITY RULE - ABSOLUTELY ENFORCED**:
    - MAXIMUM of ONE mention per ENTIRE assessment of EITHER "StrengthsFinder 2.0" OR "Predictive Index" (NEVER both)
    - This applies across ALL sections: priority_areas AND key_strengths combined
    - If one appears ANYWHERE in the assessment, the other must NOT appear ANYWHERE
    - Only include when naturally relevant to the competency being discussed
    - NEVER use direct recommendations - always use suggestive language like "consider using a tool such as StrengthsFinder 2.0" or "you might find value in an assessment tool like Predictive Index"
    - Should feel helpful and natural, not forced or promotional
    - Focus on how the chosen tool can enhance the specific competency being developed

    **PRODUCT RECOMMENDATIONS**:
    - If recommending any products (as opposed to books or reference documents), include the product name in the insight text for potential linking
    - Products should be mentioned naturally within the insight context

  - \`resources\` (array of 1-3 strings): CRITICAL RESOURCE REQUIREMENTS:
    
    **MANDATORY INCLUSION RULES**:
    - MUST include ALL techniques, methodologies, frameworks, or tools mentioned in insights
    - MUST include ALL practical resources referenced in insights
    - Use EXACT titles from this approved list when applicable:
      * For Emotional Intelligence: "Emotional Intelligence 2.0 by Travis Bradberry"
      * For Conflict Resolution: "Crucial Conversations by Kerry Patterson"
      * For Change Management: "ADKAR Model" or "Kotter 8-Step Process"
      * For Communication: "Crucial Conversations by Kerry Patterson"
      * For Leadership Development: "The Leadership Challenge" or "Good to Great by Jim Collins"
      * For Team Building: "The 7 Habits of Highly Effective People"
      * For Strategic Thinking: "Good to Great by Jim Collins"
      * For Time Management: "The 7 Habits of Highly Effective People" or "Eisenhower Matrix"
      * For Decision Making: "Thinking, Fast and Slow by Daniel Kahneman"
      * For Professional Development: "StrengthsFinder 2.0" or "DISC Assessment"
      * For Techniques: Include exact technique names (e.g., "Eisenhower Matrix", "SMART Goals", "Pomodoro Technique")
    
    **ABSOLUTE REQUIREMENT**: Every single resource listed MUST have a corresponding working link in our system. Only recommend resources that are guaranteed to have links available.

- \`key_strengths\`: An array with at least 2 objects, each for a key competency to leverage:
  - \`competency\` (string): The name of the competency from the assessment data above
  - \`example\` (string): A concrete example of this competency in action (from data or a plausible scenario relevant to their role/industry)
  - \`leverage_advice\` (array of exactly 3 strings): Three actionable, positive suggestions for further leveraging this competency. Apply the same quality standards as insights - avoid generic advice, provide specific strategies, frameworks, or research-backed approaches. The CRITICAL TOOL EXCLUSIVITY RULE and MANDATORY TECHNIQUE/METHODOLOGY RESOURCE REQUIREMENT also apply here. Tailor advice to their experience level and industry context.
  - \`resources\` (array of 0-3 strings): List any practical resources mentioned in the leverage advice using the same exact titles when possible. Include ALL techniques and methodologies mentioned for potential linking. Same absolute linking requirement applies.

### CRITICAL JSON Rules
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- The \`resources\` field must be an array of strings listing ALL resources mentioned in insights/advice.
- All arrays must contain only the specified data types.
- Structure the summary for easy paragraph splitting during post-processing with leader names as clickable links.
- When possible, use the exact resource titles listed above for consistency with our resource mapping system.
- Include ALL technique and methodology names in resources for potential linking (e.g., "Eisenhower Matrix", "SMART Goals").
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- ABSOLUTE ENFORCEMENT: Maximum ONE mention of either StrengthsFinder 2.0 or Predictive Index per ENTIRE assessment, including across both priority_areas and key_strengths arrays combined.
- Make leader names clickable links using markdown format in the summary.
- Include ALL techniques, methodologies, and products mentioned in insights within the resources array for proper linking.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- Every resource listed must have a guaranteed working link - do not recommend resources without confirmed link availability.
- **PERSONALIZATION REQUIREMENT**: Use the demographic information (role, industry, experience) to tailor all insights, examples, and leader selection for maximum relevance to the user's specific context.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, and experience level.`;
};


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

First paragraph: Begin by identifying your most distinctive competencies and what those mean for your leadership style. Include a brief example of a well-known leader who exemplifies the same top competencies, making the leader's name a clickable link to a relevant external web page (such as Wikipedia or the leader's official site) using markdown format: [Leader Name](https://example.com).

Second paragraph: Start with a transition phrase, then note your key areas for development, explaining why they matter and how your competencies can support growth in these areas.

The summary should be written as continuous text but structured so it can be split at transition phrases during post-processing.

- \`priority_areas\`: An array with exactly 3 objects, each for a Top 3 Priority Development Area:
  - \`competency\` (string): The name of the competency from the assessment data above
  - \`gap\` (number): The gap score from the assessment data above
  - \`insights\` (array of exactly 3 strings): CRITICAL INSIGHT QUALITY REQUIREMENTS:
    
    **AVOID GENERIC STATEMENTS**: Do not write obvious, surface-level statements like "Developing emotional intelligence can enhance your ability to empathize" or "Improving communication helps build better relationships."
    
    **PROVIDE ACTIONABLE, RESEARCH-BACKED INSIGHTS**: Each insight must be:
    - Actionable with specific strategies or approaches
    - Reference research, models, frameworks, or common pitfalls when relevant
    - Include practical workplace examples or scenarios
    - Address lesser-known but useful aspects of the competency
    - Provide depth beyond common knowledge
    
    **REQUIRED ELEMENTS FOR EACH INSIGHT**:
    - Must include specific techniques, frameworks, or research-backed strategies
    - Should reference measurable outcomes when possible
    - Must go beyond what most people already know about the topic
    - Should include practical implementation advice
    - One insight per competency may reference recommended resources

    **CRITICAL TOOL EXCLUSIVITY RULE**:
    - Maximum of ONE mention per assessment of EITHER Clifton Strengths OR Predictive Index (never both)
    - Only include when naturally relevant to the competency being discussed
    - If one tool is mentioned anywhere in the assessment, the other must NOT be mentioned
    - Should feel helpful and natural, not forced or promotional
    - Focus on how the chosen tool can enhance the specific competency being developed

  - \`resources\` (array of 1-3 strings): List all practical resources mentioned in the insights. When possible, use these EXACT titles for consistency:
    * For Emotional Intelligence: "Emotional Intelligence 2.0 by Travis Bradberry"
    * For Conflict Resolution: "Crucial Conversations by Kerry Patterson" or "Crucial Conversations training program"
    * For Change Management: "ADKAR Model" or "Kotter 8-Step Process"
    * For Communication: "Crucial Conversations by Kerry Patterson"
    * For Leadership Development: "The Leadership Challenge" or "Good to Great by Jim Collins"
    * For Team Building: "The 7 Habits of Highly Effective People"
    * For Strategic Thinking: "Good to Great by Jim Collins"
    * For Time Management: "The 7 Habits of Highly Effective People"
    * For Decision Making: "Thinking, Fast and Slow by Daniel Kahneman"
    * For Professional Development: "StrengthsFinder 2.0" or "DISC Assessment"

- \`key_strengths\`: An array with at least 2 objects, each for a key competency to leverage:
  - \`competency\` (string): The name of the competency from the assessment data above
  - \`example\` (string): A concrete example of this competency in action (from data or a plausible scenario)
  - \`leverage_advice\` (array of exactly 3 strings): Three actionable, positive suggestions for further leveraging this competency. Apply the same quality standards as insights - avoid generic advice, provide specific strategies, frameworks, or research-backed approaches. The CRITICAL TOOL EXCLUSIVITY RULE also applies here.
  - \`resources\` (array of 0-3 strings): List any practical resources mentioned in the leverage advice using the same exact titles when possible.

### CRITICAL JSON Rules
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- The \`resources\` field must be an array of strings listing all resources mentioned in insights/advice.
- All arrays must contain only the specified data types.
- Structure the summary for easy paragraph splitting during post-processing with leader names as clickable links.
- When possible, use the exact resource titles listed above for consistency with our resource mapping system.
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Remember: Maximum ONE mention of either Clifton Strengths or Predictive Index per entire assessment, and only when naturally relevant.
- Make leader names clickable links using markdown format in the summary.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above.`;
};

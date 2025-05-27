
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

- \`summary\`: Generate a professional, concise, and impactful assessment summary that is 6–8 sentences. Use the word "competencies" throughout (not "strengths"). Always refer to the person as "you" or "your" (never "the user" or "the user's"). 

CRITICAL FORMATTING FOR SUMMARY: Structure the summary as TWO clear paragraphs that will be separated by post-processing. Use transition phrases like "However," "At the same time," "Additionally," or "Your results also" to start the second paragraph. Follow this pattern:

First paragraph: Begin by identifying your most distinctive competencies and what those mean for your leadership style. Include a brief example of a well-known leader who exemplifies the same top competencies, naming the leader and connecting to your assessment.

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
    
    **EXAMPLES OF GOOD vs BAD INSIGHTS**:
    
    BAD (generic): "Developing emotional intelligence can enhance your ability to empathize with team members, improving communication and collaboration."
    
    GOOD (specific & actionable): "Practice the 'emotional labeling' technique from neuroscience research: when you notice strong emotions arising in meetings, mentally name the emotion (e.g., 'I'm feeling frustrated') which activates your prefrontal cortex and reduces the emotion's intensity by up to 50%."
    
    BAD (obvious): "Good communication helps build trust with your team."
    
    GOOD (actionable): "Use the 'SBI model' (Situation-Behavior-Impact) when giving feedback: describe the specific situation, the observable behavior, and its impact, which reduces defensiveness and increases the likelihood of behavior change by 40% according to CCL research."
    
    **REQUIRED ELEMENTS FOR EACH INSIGHT**:
    - Must include specific techniques, frameworks, or research-backed strategies
    - Should reference measurable outcomes when possible
    - Must go beyond what most people already know about the topic
    - Should include practical implementation advice
    - One insight per competency must reference or connect to the recommended resource

  - \`resource\` (string): A well-known, practical resource. When possible, use these EXACT titles for consistency:
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
  - \`leverage_advice\` (array of exactly 3 strings): Three actionable, positive suggestions for further leveraging this competency. Apply the same quality standards as insights - avoid generic advice, provide specific strategies, frameworks, or research-backed approaches.

### CRITICAL JSON Rules
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` field must be an array of strings ONLY. Do NOT include any other keys inside this array.
- The \`resource\` field must be at the same level as \`insights\`, NOT inside the insights array.
- All arrays must contain only the specified data types.
- Structure the summary for easy paragraph splitting during post-processing.
- When possible, use the exact resource titles listed above for consistency with our resource mapping system.
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above.`;
};

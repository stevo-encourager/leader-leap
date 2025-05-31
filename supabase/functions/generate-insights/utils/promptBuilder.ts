


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

### CRITICAL LINKING REQUIREMENTS

**You MUST:**
- Provide a valid, working resource link for EVERY book, article, methodology, framework, model, tool, or leader mentioned, wherever it appears in the output (summary, insights, advice, or resources arrays).
- Embed links directly within the text at the point of mention using Markdown format: \`[Name](https://valid-link.com)\`.
- Never output "resource link not currently available", "link unavailable", or similar placeholder text—ALWAYS find a credible, working link (official site, major publisher, established resource, or Wikipedia as a last resort).
- If a recommended framework or methodology is mentioned (e.g. "SBI feedback model"), include a link right in the sentence:  
  Example: \`Implement the [SBI (Situation-Behavior-Impact) feedback model](https://www.mindtools.com/ajr2b6w/sbi-feedback) to enhance communication...\`
- If you mention a book, tool, or article, link it in the text:  
  Example: \`Consider "Radical Candor" ([Kim Scott](https://www.radicalcandor.com/)) for direct feedback culture.\`

**If you cannot find a credible link after a reasonable search, replace the recommendation with one that you CAN link properly.**

### DEMOGRAPHIC CONTEXT FOR TAILORED INSIGHTS

**User Profile:**
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}  
- Leadership Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}

### INSIGHT, SUMMARY, AND RESOURCE GENERATION RULES

- All recommendations, summaries, and insights must reference at least one specific book, article, framework, methodology, or leader relevant to the user's role, industry, and experience—and must provide a working link as described above.
- Every time you mention a leader (e.g. Satya Nadella), link their official bio, personal site, or a reputable profile (not Wikipedia unless no other option).
- Every time you mention a book, link to its publisher, author's site, or a reputable distributor.
- Every time you mention a framework or methodology, link to an official or highly reputable explanation.
- All links must be embedded inline using \`[Name](URL)\` format, not just listed at the bottom.
- The resources array for each section must contain these same links (no placeholders), and should not duplicate links already embedded in the text unless required by JSON structure.

### FIELD AND STRUCTURE REQUIREMENTS

- **summary**: 6–8 sentences, two paragraphs, must include at least one linked leader and one linked methodology/book/tool.
- **priority_areas**: Array of 3 objects, each with 3 insights (each insight must have at least one inline link per any recommended method or resource) and 3 resource links (all valid).
- **key_strengths**: At least 2 objects, each with 3 leverage_advice items (each with at least one inline link if a method/resource is mentioned) and 3 resource links (all valid).
- All arrays must contain only strings.
- Output only valid JSON, no extra text.

### JSON VALIDATION CHECKLIST

Before outputting, verify:
- Every time a book, leader, methodology, or resource is mentioned, a valid working link is provided inline.
- No "resource link not currently available" or similar placeholder is present.
- Every resource link in arrays is a valid, working link for the item mentioned, not a placeholder.
- No Wikipedia links unless no other reputable source exists.
- No generic or empty resource recommendations.
- All JSON is valid and matches the required structure.

### STRUCTURE

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

### CRITICAL JSON RULES

- Output MUST be valid JSON only.
- No text or markdown outside JSON.
- All resource and method mentions MUST have a working link inline.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, and experience level.`;
};



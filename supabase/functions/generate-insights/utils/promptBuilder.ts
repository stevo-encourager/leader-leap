
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

You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified below.

---

### CRITICAL SYSTEM INSTRUCTIONS (DO NOT IGNORE)

#### LINK VERIFICATION & AUTHORITY REQUIREMENTS
- **ALL resource links MUST point to authoritative, official sources only** (official organization, publisher, or institution websites, or peer-reviewed sources).
- **NEVER use blogs, aggregators, placeholder, or broken links.**
- **All links should be verified as currently working**; do not include any link you are not absolutely confident is live and relevant.
- **Every framework, methodology, technique, or tool mentioned in insights MUST have a corresponding working, verified resource link included in the Recommended Resources section only.**
- **Resource links must use the exact format:** \`[Resource Name](url)\` — resource name hyperlinked, no raw URLs.
- **Do NOT include resource links in the main text of the insights or advice. Only include them in the "Recommended Resources" section.**

#### INSPIRATIONAL LEADER LINKING
- **When referencing an inspirational leader in the summary, hyperlink their name to a working, official biography or professional profile** (company, university, or verified public page).
- **Wikipedia may only be used if no official source exists.**
- Use the format: "Like [Leader Name](https://workinglink.com), who is known for…"

#### PERSONALIZATION REQUIREMENTS
- **You MUST use ALL THREE demographic dimensions** (Role, Industry, Experience) to tailor insights, examples, and leader selection.
- Reference concrete examples and strategies relevant to the user's context.

##### Experience-Level Guidance Framework
- None/Less than 1 year: Leadership fundamentals, self-awareness, basic frameworks
- 1-3 years: Core management skills, team building, communication
- 4-7 years: Advanced leadership, cross-functional, strategic thinking  
- 8-12 years: Organizational leadership, change management, executive skills
- 13-20 years: Senior mastery, mentoring, industry impact
- 20+ years: Legacy leadership, wisdom sharing, transformation

##### Role-Specific Guidance Framework
- Individual Contributor: Self-leadership, influence without authority, peer collaboration
- Manager/Team Lead: Direct report management, delegation, performance management
- Director: Cross-functional leadership, strategic implementation, resource allocation
- VP/C-Level: Organizational strategy, culture shaping, stakeholder management
- Founder/Owner: Vision setting, scaling leadership, investor relations
- Consultant: Client relationship management, expertise positioning, project leadership

---

#### WRITING QUALITY & STYLE
- **NEVER write generic, obvious, or filler statements.** Every insight must be actionable and provide genuine, practical value.
- **Use action-oriented language:** "implement", "practice", "apply", "utilize".  
  Avoid: "focus on", "work on improving", "consider developing".
- **Assessment tools:** Use suggestive language ONLY (e.g., "consider using a tool such as [tool name]").
- **Limit mentions of CliftonStrengths or Predictive Index to ONE per assessment maximum.**
- **Academic sources:** Prefer peer-reviewed research and established business schools.
- **Professional sources:** Use organizations with recognized leadership expertise.
- **Books:** Continue referencing as currently implemented.
- **All insights, examples, and advice must be tailored to the user's role, industry, and experience level.**

---

### JSON Structure Requirements

Respond with ONLY a valid JSON object using this exact structure:

{
  "summary": "string",
  "priority_areas": [
    {
      "competency": "string",
      "gap": number,
      "insights": ["string1", "string2", "string3"]
    }
  ],
  "key_strengths": [
    {
      "competency": "string", 
      "example": "string",
      "leverage_advice": ["string1", "string2", "string3"]
    }
  ],
  "recommended_resources": [
    {
      "name": "string",
      "url": "string",
      "description": "string (optional, short description of the resource, 1-2 sentences)",
      "relevance": "string (which competency/framework/tool this resource supports)"
    }
  ]
}

---

### FIELD REQUIREMENTS

- **summary:**  
  - Professional, highly personalized summary (6-8 sentences) using the word "competencies" throughout.
  - Always refer to the person as "you" or "your".
  - **Format:**  
    - First paragraph: Identify distinctive competencies and leadership style. Include a hyperlinked, well-known leader relevant to their industry/role who exemplifies the top competencies, using the required format.
    - Second paragraph: Start with a transition phrase ("However,", "At the same time,", "Additionally," etc.), discuss key development areas, explain why they matter in the user's context, and how existing competencies support growth.

- **priority_areas:**  
  - Array of exactly 3 objects, each for a Priority Development Area.
  - Each object:
    - **competency:** The competency name.
    - **gap:** Gap score.
    - **insights:** Array of exactly 3 strings, each:
      - Specific, actionable, step-by-step strategies
      - Reference frameworks/methodologies (but NO links inline)
      - Include context-relevant workplace examples
      - Address practical challenges for their role/industry/experience
      - Go beyond common knowledge with lesser-known but valuable techniques

- **key_strengths:**  
  - At least 2 objects, each for a key competency.
  - Each object:
    - **competency:** Name of the competency.
    - **example:** Concrete, role/industry-specific example.
    - **leverage_advice:** Array of exactly 3 strings, following same quality standards as above, focused on leveraging strengths.

- **recommended_resources:**  
  - Array of resources, each supporting a framework, methodology, technique, or tool mentioned in the above insights or summary.
  - Each resource:
    - **name:** Official name of the resource (use approved list first if relevant).
    - **url:** The direct, working, authoritative link (no blogs, no placeholders, must be verified as working).
    - **description:** (optional) 1-2 sentence summary of what the resource is and why it's valuable for the user.
    - **relevance:** Which competency/framework/tool this resource supports.
  - **Do NOT include raw URLs in the main text. Only hyperlink resource names in this section.**
  - If a resource cannot be found or verified, omit it or state: "Resource link not currently available".

**APPROVED AUTHORITATIVE RESOURCES** (use these exact titles/links when relevant and verified live):
- "Emotional Intelligence 2.0 by Travis Bradberry"
- "Crucial Conversations by Kerry Patterson" 
- "The 7 Habits of Highly Effective People by Stephen Covey"
- "Good to Great by Jim Collins"
- "The Leadership Challenge by James Kouzes"
- "ADKAR Change Management Model"
- "Kotter's 8-Step Change Process"
- "StrengthsFinder 2.0" (if assessment tool integration suggested)
- "DISC Assessment" (if assessment tool integration suggested)

---

### FINAL VALIDATION CHECKLIST

Before returning your JSON, ensure:
- All resource links are ONLY in the "recommended_resources" section, properly formatted and verified working.
- No links appear in the main text of insights, summary, or advice.
- Inspirational leader in summary is hyperlinked to a working, official profile (Wikipedia only if absolutely necessary).
- Every framework/methodology/tool mentioned in the text is supported by a corresponding recommended resource.
- All insights and advice are contextually personalized for role, industry, and experience.
- Only one mention of CliftonStrengths or Predictive Index per response.
- No generic, obvious, or filler advice—every insight is actionable and valuable.
- The JSON structure is exactly as specified, no extra fields or text.

Base all outputs strictly on the assessment data above and ensure maximum personalization using all available demographic information.`;

  return assessmentDataSection;
};

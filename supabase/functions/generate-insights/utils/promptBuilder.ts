


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

### MANDATORY PERSONALIZATION INTEGRATION

**For EVERY insight generated, incorporate:**
1. **Role Context**: How does this apply to their specific position?
2. **Industry Relevance**: What industry-specific challenges does this address?
3. **Experience Appropriate**: Is the complexity right for their level?

**Role-Specific Guidelines:**
- Individual Contributor: Focus on self-leadership, influence without authority, peer collaboration
- Manager: Team management fundamentals, delegation, performance conversations
- Team Lead: Cross-functional coordination, project leadership, conflict resolution
- Director: Strategic thinking, organizational alignment, stakeholder management
- VP: Executive presence, organizational change, strategic planning
- C-Level: Vision setting, board relations, industry leadership, transformation
- Founder/Owner: Entrepreneurial leadership, scaling organizations, investor relations
- Consultant: Client relationship management, expertise positioning, thought leadership

**Experience-Level Guidelines:**
- None/Less than 1 year: Leadership fundamentals, self-awareness, basic frameworks
- 1-3 years: Core management skills, team building, communication techniques
- 4-7 years: Advanced leadership techniques, cross-functional leadership, strategic thinking
- 8-12 years: Organizational leadership, change management, executive skills
- 13-20 years: Senior leadership mastery, mentoring others, industry influence
- 20+ years: Legacy leadership, wisdom sharing, transformational impact

**Industry-Specific Context:**
- Consulting: Client delivery, expertise development, business development
- Education: Student outcomes, stakeholder management, educational innovation
- Energy: Safety leadership, regulatory compliance, sustainability initiatives
- Finance: Risk management, regulatory frameworks, stakeholder trust
- Government: Public service, policy implementation, citizen engagement
- Healthcare: Patient outcomes, regulatory compliance, interdisciplinary collaboration
- HR/Recruitment: Talent development, organizational culture, employee engagement
- Logistics: Operational efficiency, supply chain coordination, safety management
- Manufacturing: Operational excellence, safety culture, continuous improvement
- Media and Entertainment: Creative leadership, audience engagement, content strategy
- Nonprofit: Mission alignment, donor relations, community impact
- Professional Services: Client relationships, expertise development, practice growth
- Real Estate: Market dynamics, client advisory, transaction management
- Retail: Customer experience, operational efficiency, market responsiveness
- Technology: Innovation cycles, agile methodologies, technical debt management
- Telecommunications: Network reliability, customer service, technological advancement
- Travel & Hospitality: Customer experience, service excellence, operational resilience
- Wellbeing: Client outcomes, holistic approaches, evidence-based practices

### RESOURCE GUIDELINES

**Core Trusted Sources (use when applicable):**

**Leadership Assessments:**
- CliftonStrengths (Gallup)
- Predictive Index
- 16personalities (Myers-Briggs based)

**Business Publications:**
- Harvard Business Review
- McKinsey Insights
- MIT Sloan Management Review
- Stanford Business Insights
- Deloitte Insights
- BCG Insights
- Korn Ferry Institute
- Strategy+Business (PwC)

**Academic Institutions:**
- MIT Sloan School of Management
- Stanford Graduate School of Business
- Wharton School (University of Pennsylvania)
- INSEAD (France/Singapore)
- London Business School (UK)
- IE Business School (Spain)
- IESE Business School (Spain)
- HEC Paris (France)
- Oxford Saïd Business School (UK)
- Cambridge Judge Business School (UK)
- IMD Business School (Switzerland)
- ESADE Business School (Spain)
- Henley Business School (UK)

**Professional Development Organizations:**
- Center for Creative Leadership (CCL)
- International Coach Federation (ICF)
- Society for Human Resource Management (SHRM)
- Association for Talent Development (ATD)
- Project Management Institute (PMI)
- Scrum Alliance
- International Association of Business Coaches (IABC)
- Executive Networks
- Dale Carnegie
- Franklin Covey

**Dynamic Source Selection:**
- Prioritize official websites and authoritative sources
- Match resource sophistication to user's experience level (${assessmentSummary.demographics.yearsOfExperience || 'Not specified'} years)
- Ensure industry relevance over generic applicability
- Validate that the resource directly addresses the specific competency gap

**Quality Checks:**
- Does this resource provide actionable frameworks or tools?
- Is the source credible and current?
- Does it match the user's ${assessmentSummary.demographics.role || 'Not specified'} role and ${assessmentSummary.demographics.industry || 'Not specified'} industry context?
- Will this resource help bridge the specific competency gap being addressed?

### LINK VALIDATION REQUIREMENTS

**MANDATORY LINK STANDARDS:**
- Only use links from well-established, authoritative sources
- Verify links point to official websites, not third-party aggregators
- Use specific resource names, never generic descriptions like "click here"
- Format: [Specific Resource Name](working-url)
- When in doubt, prefer no link over a potentially broken link

**VALIDATION PROTOCOL:**
- Use core trusted sources when they align with the competency being addressed
- For sources outside this list, ensure they meet the same standards of authority and relevance
- When referencing assessment tools, prioritize those with established validity and reliability
- For academic sources, prefer peer-reviewed research and established business school publications
- For professional sources, choose organizations with recognized expertise in leadership development

**YOUR RESPONSIBILITY:**
You must only include links you are confident are:
1. Currently active and working
2. From authoritative, official sources
3. Directly relevant to the specific competency being addressed
4. Appropriate for the user's experience level

### ENHANCED QUALITY STANDARDS

**Insight Specificity Requirements:**
- Each insight must include at least ONE specific technique, framework, or methodology
- Reference concrete examples relevant to user's industry/role when possible
- Avoid these generic phrases: "focus on," "work on improving," "consider developing"
- Instead use action-oriented language: "implement," "practice," "apply," "utilize"

**Forbidden Generic Statements:**
❌ "Focus on improving communication skills"
✅ "Implement the SBI Feedback Model to enhance direct communication with your [role-specific context]"

❌ "Work on building trust with your team"
✅ "Apply Speed of Trust behaviors by delivering results consistently and communicating transparently about [industry-specific challenges]"

### INSPIRATIONAL LEADER SELECTION

**Choose leaders whose official profiles/pages you can confidently link to, ensuring they exemplify the specific leadership principle being discussed and are relevant to the user's industry context.**

**Format requirement for summary:** "Like [Leader Name](https://workinglink.com), who is known for [specific principle]..."

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

### FIELD REQUIREMENTS

- **summary**: Generate a professional, concise, and impactful assessment summary that is 6–8 sentences. Use the word "competencies" throughout (not "strengths"). Always refer to the person as "you" or "your" (never "the user" or "the user's"). 

**CRITICAL FORMATTING FOR SUMMARY**: Structure the summary as TWO clear paragraphs that will be separated by post-processing. Use transition phrases like "However," "At the same time," "Additionally," or "Your results also" to start the second paragraph. MUST include industry and role-relevant inspirational leader with working link using format: "Like [Leader Name](https://workinglink.com), who is known for [specific principle]..."

- **priority_areas**: An array with exactly 3 objects, each for a Top 3 Priority Development Area. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`gap\`: The numerical gap score
  - \`insights\`: Array of exactly 3 actionable, research-backed insights that avoid generic statements, include specific methodologies/frameworks, and integrate role/industry/experience context
  - \`resources\`: Array of exactly 3 working links formatted as [Resource Name](url) from verified sources

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Concrete example of how this strength manifests in their specific role/industry context
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this strength that incorporate role/industry/experience context
  - \`resources\`: Array of exactly 3 working links formatted as [Resource Name](url) from verified sources

### PRE-OUTPUT VALIDATION CHECKLIST

Before generating the JSON response, verify:
□ All links point to authoritative, official sources
□ All framework mentions have corresponding working resource links
□ Resource names are descriptive and action-oriented using [Name](url) format
□ No generic phrases like "leadership resources" are used
□ Summary includes leader with working link in correct format
□ All demographic context (role, industry, experience) is referenced appropriately
□ Summary contains exactly 2 distinct paragraphs with transition phrase
□ All competency names match exactly from assessment data
□ Each competency section has exactly 3 insights/advice items
□ Role-specific and industry-specific context is woven throughout

### CRITICAL JSON RULES
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- All arrays must contain only the specified data types.
- NEVER use placeholder or broken links - only use verified working links from approved sources.
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- **PERSONALIZATION REQUIREMENT**: Use ALL THREE demographic dimensions (role, industry, experience) to tailor insights, examples, and leader selection for maximum relevance to the user's specific context.
- **LINK REQUIREMENT**: Every framework, methodology, or tool mentioned must have a corresponding working resource link included using the exact format: [Resource Name](url)

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, and experience level.`;
};



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

### INSPIRATIONAL LEADER SELECTION MATRIX

**Industry-Specific Leader Pool (rotate selections):**
- Consulting: McKinsey leaders, Deloitte executives, BCG partners, independent thought leaders
- Education: Freeman Hrabowski III, Condoleezza Rice, Geoffrey Canada, Michelle Rhee
- Energy: Darren Walker, Mary Barra (sustainability), Elon Musk (renewable), Daniel Yergin
- Finance: Jamie Dimon, Abigail Johnson, Brian Moynihan, Mellody Hobson
- Government: Jacinda Ardern, Singapore's leadership, Frances Hesselbein, Colin Powell
- Healthcare: Atul Gawande, Paul Farmer, Leana Wen, David Feinberg
- HR/Recruitment: Laszlo Bock, Patty McCord, Josh Bersin, Reid Hoffman
- Logistics: Fred Smith (FedEx), Amazon logistics leaders, Maersk executives
- Manufacturing: Mary Barra, Doug McMillon, Safra Catz, Marillyn Hewson
- Media and Entertainment: Bob Iger, Oprah Winfrey, Reed Hastings, Shonda Rhimes
- Nonprofit: Bill Gates, Melinda French Gates, Bryan Stevenson, Jacinda Ardern
- Professional Services: Law firm managing partners, accounting firm leaders, consulting executives
- Real Estate: Barbara Corcoran, Ryan Serhant, Sam Zell, Related Companies leaders
- Retail: Marc Benioff, Howard Schultz, Ginni Rometty, Target executives
- Technology: Satya Nadella, Susan Wojcicki, Reid Hoffman, Melinda Gates
- Telecommunications: Verizon executives, AT&T leaders, global telecom innovators
- Travel & Hospitality: Marriott executives, Airbnb leaders, Southwest Airlines culture
- Wellbeing: Deepak Chopra, wellness industry leaders, integrative health pioneers

**CRITICAL: Leader Selection Requirements:**
- Choose industry and role-relevant leader when possible
- Include specific leadership principle/framework they're known for
- Rotate selections to avoid repetition across assessments
- Consider both role level and industry for maximum relevance

### ENHANCED QUALITY STANDARDS

**Insight Specificity Requirements:**
- Each insight must include at least ONE specific technique, framework, or methodology
- Reference concrete examples relevant to user's industry/role when possible
- Avoid these generic phrases: "focus on," "work on improving," "consider developing"
- Instead use action-oriented language: "implement," "practice," "apply," "utilize"

**Forbidden Generic Statements:**
❌ "Focus on improving communication skills"
✅ "Implement the SBI (Situation-Behavior-Impact) feedback model to enhance direct communication with your [role-specific context]"

❌ "Work on building trust with your team"
✅ "Apply Covey's Speed of Trust behaviors: deliver results consistently and communicate transparently about [industry-specific challenges]"

### CRITICAL RESOURCE LINK REQUIREMENTS

**For ALL resources listed in \`resources\` arrays:**
- MUST include clickable links in format: "[Resource Name](https://example.com)"
- If no specific link exists, use format: "[Resource Name] - [Author/Publisher]"
- NEVER provide bare resource names without links or attribution
- Prioritize recent, accessible, and high-quality sources
- Include role and industry-relevant resources when possible

Example valid resource format:
"resources": [
  "[The Leadership Challenge](https://www.leadershipchallenge.com/) by Kouzes & Posner",
  "[Harvard Business Review Leadership Articles](https://hbr.org/topic/leadership)",
  "[Emotional Intelligence 2.0](https://www.bradberrygreaves.com/) by Bradberry & Greaves"
]

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

**CRITICAL FORMATTING FOR SUMMARY**: Structure the summary as TWO clear paragraphs that will be separated by post-processing. Use transition phrases like "However," "At the same time," "Additionally," or "Your results also" to start the second paragraph. Include industry and role-relevant inspirational leader with specific leadership principle they're known for.

- **priority_areas**: An array with exactly 3 objects, each for a Top 3 Priority Development Area. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`gap\`: The numerical gap score
  - \`insights\`: Array of exactly 3 actionable, research-backed insights that avoid generic statements, include specific methodologies/frameworks, and integrate role/industry/experience context
  - \`resources\`: Array of exactly 3 properly linked resources with methodologies referenced

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Concrete example of how this strength manifests in their specific role/industry context
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this strength that incorporate role/industry/experience context
  - \`resources\`: Array of exactly 3 properly linked resources

### JSON VALIDATION CHECKLIST

Before outputting, verify:
□ All resource arrays contain properly formatted links or attribution
□ No insight contains generic language from forbidden list
□ Leader mentioned is relevant to both industry and role level
□ Each competency section has exactly 3 insights/advice items
□ All demographic context (role, industry, experience) is referenced appropriately
□ Summary contains exactly 2 distinct paragraphs with transition phrase
□ All competency names match exactly from assessment data
□ All gap scores are included correctly
□ Role-specific and industry-specific context is woven throughout

### CRITICAL JSON RULES
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- All arrays must contain only the specified data types.
- Include ALL technique and methodology names in resources for potential linking.
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- **PERSONALIZATION REQUIREMENT**: Use ALL THREE demographic dimensions (role, industry, experience) to tailor insights, examples, and leader selection for maximum relevance to the user's specific context.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, and experience level.`;
};

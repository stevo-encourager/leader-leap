

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

### INSPIRATIONAL LEADER SELECTION WITH REQUIRED LINKS

**Industry-Specific Leader Pool (rotate selections and ALWAYS include working link):**

**CRITICAL: For the selected leader, you MUST include a working link in the summary using this format:**
"Like [Leader Name](https://workinglink.com), who is known for [specific principle]..."

**Verified Leader Links by Industry:**
- Consulting: [Sheryl Sandberg](https://www.linkedin.com/in/sherylsandberg/), [McKinsey leaders](https://www.mckinsey.com/about-us/leadership)
- Education: [Freeman Hrabowski III](https://www.umbc.edu/president/), [Geoffrey Canada](https://hcz.org/about-us/leadership/)
- Energy: [Mary Barra](https://www.gm.com/company/leadership/mary-barra.html), [Darren Walker](https://www.fordfoundation.org/about/people/darren-walker/)
- Finance: [Jamie Dimon](https://www.jpmorganchase.com/about/our-leadership/jamie-dimon), [Abigail Johnson](https://www.fidelity.com/about-fidelity/our-company/abigail-johnson)
- Government: [Frances Hesselbein](https://www.hesselbeinInstitute.org/), [Colin Powell](https://www.britannica.com/biography/Colin-Powell)
- Healthcare: [Atul Gawande](https://www.atulgawande.com/), [Paul Farmer](https://www.pih.org/pages/paul-farmer)
- HR/Recruitment: [Laszlo Bock](https://www.humu.com/team/), [Reid Hoffman](https://www.linkedin.com/in/reidhoffman/)
- Logistics: [Fred Smith](https://about.van.fedex.com/our-story/leadership-team/frederick-smith/), [UPS leaders](https://about.ups.com/us/en/our-company/leadership.html)
- Manufacturing: [Mary Barra](https://www.gm.com/company/leadership/mary-barra.html), [Doug McMillon](https://corporate.walmart.com/our-story/leadership/doug-mcmillon)
- Media and Entertainment: [Bob Iger](https://thewaltdisneycompany.com/leaders/robert-iger/), [Reed Hastings](https://about.netflix.com/en/leadership)
- Nonprofit: [Bill Gates](https://www.gatesfoundation.org/about/leadership/bill-gates), [Melinda French Gates](https://www.pivotventures.com/team/melinda)
- Professional Services: [Professional services leaders](https://www.pwc.com/gx/en/about/leadership.html), [Deloitte executives](https://www2.deloitte.com/global/en/pages/about-deloitte/articles/leadership.html)
- Real Estate: [Barbara Corcoran](https://www.barbaracorcoran.com/), [Related Companies leaders](https://www.related.com/about/leadership/)
- Retail: [Marc Benioff](https://www.salesforce.com/company/leadership/bios/bio-lead-marc-benioff/), [Howard Schultz](https://stories.starbucks.com/leadership/)
- Technology: [Satya Nadella](https://news.microsoft.com/exec/satya-nadella/), [Susan Wojcicki](https://www.linkedin.com/in/susanwojcicki/)
- Telecommunications: [Verizon executives](https://www.verizon.com/about/our-company/executive-bios), [AT&T leaders](https://about.att.com/pages/leadership)
- Travel & Hospitality: [Marriott executives](https://www.marriott.com/about/leadership.mi), [Southwest leaders](https://www.southwest.com/about-southwest/leadership/)
- Wellbeing: [Wellness leaders](https://www.wellnesscorporatesolutions.com/), [Integrative health pioneers](https://www.functionalmedicine.org/)

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

**MANDATORY: ALL resources must include working links. Use these verified sources:**

**For Leadership Books/Authors:**
- Harvard Business Review: https://hbr.org/topic/leadership
- Center for Creative Leadership: https://www.ccl.org/
- Leadership development: https://www.leadershipchallenge.com/
- Ken Blanchard: https://www.kenblanchard.com/
- John Maxwell: https://www.johnmaxwell.com/
- Brené Brown: https://brenebrown.com/
- Simon Sinek: https://simonsinek.com/

**For Frameworks/Methodologies mentioned in insights:**
- Emotional Intelligence: https://www.eiconsortium.org/
- DISC Assessment: https://www.discprofile.com/
- StrengthsFinder: https://www.gallup.com/cliftonstrengths/
- 360 Feedback: https://www.ccl.org/articles/leading-effectively-articles/what-is-360-degree-feedback/
- Design Thinking: https://www.ideou.com/pages/design-thinking
- Agile Leadership: https://www.scrum.org/resources/blog/what-agile-leadership
- Change Management: https://www.prosci.com/methodology/adkar
- Coaching Skills: https://coactive.com/learning-hub/fundamentals/what-is-co-active-coaching/

**For Business/Management Resources:**
- McKinsey Insights: https://www.mckinsey.com/featured-insights/leadership
- Deloitte Leadership: https://www2.deloitte.com/us/en/insights/topics/leadership.html
- MIT Leadership: https://mitsloan.mit.edu/ideas-made-to-matter/topic/leadership
- Stanford Leadership: https://www.gsb.stanford.edu/insights/leadership
- Wharton Leadership: https://knowledge.wharton.upenn.edu/topic/leadership/

**CRITICAL: When you mention a specific framework, methodology, or tool in an insight, you MUST include a related resource link for it in that section's resources array.**

**Resource Format Requirements:**
- MUST use format: "[Resource Name](https://workinglink.com)"
- If mentioning a book: "[Book Title](https://workinglink.com) by Author Name"  
- NEVER use placeholder links or "example.com"
- ALWAYS use verified working links from the approved list above
- If you mention SBI model, include link to feedback training
- If you mention DISC, include DISC assessment link
- If you mention emotional intelligence, include EI consortium link

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
  - \`resources\`: Array of exactly 3 working links from approved list above, ensuring any framework/methodology mentioned in insights has a corresponding resource

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Concrete example of how this strength manifests in their specific role/industry context
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this strength that incorporate role/industry/experience context
  - \`resources\`: Array of exactly 3 working links from approved list above, ensuring any framework/methodology mentioned in advice has a corresponding resource

### JSON VALIDATION CHECKLIST

Before outputting, verify:
□ Summary includes leader with working link in correct format
□ All resource arrays contain working links from approved list above
□ Every framework/methodology mentioned in insights has corresponding resource link
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
- NEVER use placeholder or broken links - only use verified working links from approved list above.
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- **PERSONALIZATION REQUIREMENT**: Use ALL THREE demographic dimensions (role, industry, experience) to tailor insights, examples, and leader selection for maximum relevance to the user's specific context.
- **LINK REQUIREMENT**: Every framework, methodology, or tool mentioned must have a corresponding working resource link included.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, and experience level.`;
};



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

// Build the validated leaders list for the prompt
const buildValidatedLeadersList = (): string => {
  return `
**VALIDATED INSPIRATIONAL LEADERS - USE ONLY THESE LEADERS:**

**Transformational & Empathetic Leadership:**
- Satya Nadella (Microsoft transformation, empathetic leadership)

**Collaborative & Inclusive Leadership:**
- Mary Barra (Automotive transformation, inclusive culture)

**Values-Based & Learning-Oriented Leadership:**
- Marc Benioff (Values-driven business, continuous learning)

**Strategic & Empowering Leadership:**
- Indra Nooyi (Strategic thinking, employee empowerment)

**"Founder Mode" & Humble Inquiry Leadership:**
- Brian Chesky (Scaling organizations, staying connected to mission)

**Data-Driven & High-Performance Culture Leadership:**
- Reed Hastings (Performance culture, data-driven decisions)

**Servant Leadership & Financial Inclusion:**
- Thasunda Brown Duckett (Community impact, servant leadership)

**Sustainable & Mission-Driven Leadership:**
- Paul Polman (Sustainable business, long-term thinking)

**Direct & Crisis Management Leadership:**
- Jamie Dimon (Crisis leadership, direct communication)

**Technical Visionary & Innovation Leadership:**
- Jensen Huang (Innovation leadership, technical vision)

**Principle-Based & "Why Culture" Leadership:**
- Andy Jassy (Principle-centered decisions, cultural alignment)

**Transparent, Creative, and Human-Centered:**
- Stewart Butterfield (Transparent communication, creative leadership)

**Empathetic, Empowering, and Purpose-Driven:**
- Whitney Wolfe Herd (Purpose-driven innovation, empathetic leadership)

**Tech-Forward, Ethical, and Strategic Transformation:**
- Arvind Krishna (Ethical technology, transformation leadership)

**Bold, Mission-Driven, Inclusion-Focused:**
- Reshma Saujani (Bold advocacy, inclusion-focused leadership)

**Global Advocacy, Partnership-Driven, Narrative Empowerment:**
- Elizabeth Nyamayaro (Global impact, partnership building)
`;
};

// Build the validated resources list for the prompt
const buildValidatedResourcesList = (): string => {
  return `
**VALIDATED RESOURCE DATABASE - USE ONLY THESE RESOURCES:**

**Time Management & Productivity:**
- The Eisenhower Matrix - Priority Management
- Eisenhower Decision Matrix Guide
- The Pomodoro Technique
- Getting Things Done (GTD) Methodology

**Goal Setting & Planning:**
- SMART Goals Framework
- Objectives and Key Results (OKRs)
- OKR Framework Guide

**Communication & Feedback:**
- SBI Feedback Model
- Radical Candor Framework
- What is Nonviolent Communication
- Active Listening Techniques

**Decision Making:**
- OODA Loop
- DACI Decision Making Framework
- RACI 'Responsibility Assignment Matrix'

**Strategic Thinking:**
- SWOT Analysis Framework
- Design Thinking Process by IDEO
- Scenario Planning: Step by Step Guide

**Emotional Intelligence:**
- Emotional Intelligence by Daniel Goleman
- 16 Personalities test (MBTI)

**Trust & Relationship Building:**
- The Speed of Trust by Stephen Covey
- The Trust Equation

**Delegation & Empowerment:**
- 7 Models for Delegation
- Situational Leadership: What it is and how to build it

**Performance Management:**
- Performance management that puts people first
- Effective One-on-One Meetings (listen)

**Conflict Resolution:**
- Thomas-Kilmann Conflict Resolution Model
- Getting to Yes - Interest-Based Negotiation

**Change Management:**
- ADKAR Change Management Model
- Kotter's 8-Step Change Process
- Bridges Transition Model
- Lewin's 3-Stage Change Model

**Team Development:**
- Tuckman's Team Development Model
- Creating A Team Charter
- Ways of Working & Guiding Principles (watch)
- A Guide to Harnessing Psychological Safety

**Team Communication:**
- Why It's Necessary to Improve Team Communication
- 3 Easy Steps to Staff Meetings That Don't Suck

**Learning & Development:**
- 70-20-10 Learning and Development Model
- What is a Growth Mindset
- Deliberate Practice Framework

**Coaching & Mentoring:**
- GROW Coaching Model
- How to have a Coaching Conversation

**Career Development:**
- How to create a career development plan in 5 steps
- Why It's ALWAYS A Good Idea To Build Your Personal Brand
- Strategic Networking for Leaders

**Problem Solving:**
- The 5 Whys Technique (watch)

**Assessment Tools:**
- StrengthsFinder 2.0
- The Predictive Index

**Leadership Books:**
- Emotional Intelligence 2.0 by Travis Bradberry
- Crucial Conversations by Kerry Patterson
- The 7 Habits of Highly Effective People by Stephen Covey
- Good to Great by Jim Collins
- Dare to Lead by Brené Brown
- The Leadership Challenge by James Kouzes
- Primal Leadership by Daniel Goleman
- Atomic Habits by James Clear
- Getting Things Done by David Allen
- Reinventing Organisations by Frederic Laloux
- The Pyramid Principle by Barbara Minto
- The Captain Class by Sam Walker
- Leading Change by John Kotter
- The Power of Habit by Charles Duhigg
- Build, Excite, Equip by Nicola Graham
- The 17 Indisputable Laws of Teamwork by John Maxwell
- Thinking Fast and Slow by Daniel Kahneman
- Getting To Yes by Roger Fisher and William Ury
- Playing To Win by AG Lafley & Roger Martin
- Human Skills by Elizabeth Nyamayaro
- Radical Candor by Kim Scott
- Nonviolent Communication by Marshall B. Rosenberg
`;
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

  const validatedResourcesList = buildValidatedResourcesList();
  const validatedLeadersList = buildValidatedLeadersList();

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

${validatedResourcesList}

${validatedLeadersList}

### CRITICAL RESOURCE SELECTION RULES

**MANDATORY RESOURCE CONSTRAINTS:**
- You MUST ONLY use resources from the validated resource database above
- NEVER create or suggest resources not in this list
- Each resource name you use must match EXACTLY as written in the database
- If a framework or methodology you want to mention is not in the database, do not include it as a resource
- Always use the exact resource title as specified in the database

**Resource Selection Process:**
1. Identify the specific framework, tool, or methodology in your insight
2. Find the EXACT matching resource name from the validated database
3. Use only that exact name in your resources array
4. If no exact match exists, do not include a resource for that insight

**Quality Validation:**
- Every resource must directly support the specific insight being provided
- Prioritize the most authoritative and specific resource for each recommendation
- Match resource sophistication to user's experience level (${assessmentSummary.demographics.yearsOfExperience || 'Not specified'} years)
- Ensure industry relevance when selecting between similar resources

### CRITICAL INSPIRATIONAL LEADER SELECTION RULES

**MANDATORY LEADER CONSTRAINTS:**
- You MUST ONLY use leaders from the validated leaders database above
- NEVER create or reference leaders not in this list
- Each leader name you use must match EXACTLY as written in the database
- If you want to reference a leader not in the database, omit the leader reference entirely
- Always use the exact leader name and principle as specified in the database

**Leader Selection Process:**
1. Identify the leadership principle you want to highlight in your summary
2. Find the EXACT matching leader from the validated database who exemplifies that principle
3. Use only leaders whose names and principles match exactly from the database
4. If no exact match exists for your intended principle, omit the leader reference

**Leader Quality Validation:**
- Every leader reference must directly relate to the specific leadership principle being discussed
- Ensure the leader's known expertise aligns with the user's industry context when possible
- Match leader examples to user's experience level and role context

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

**Choose leaders whose names appear EXACTLY in the validated leaders list above, ensuring they exemplify the specific leadership principle being discussed and are relevant to the user's industry context.**

**CRITICAL: You MUST ONLY use leaders from the validated database above. Do not reference any leader not explicitly listed.**

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
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Concrete example of how this strength manifests in their specific role/industry context
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this strength that incorporate role/industry/experience context
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified

### PRE-OUTPUT VALIDATION CHECKLIST

Before generating the JSON response, verify:
□ All resource names match EXACTLY with the validated database
□ No custom or external resources are included
□ Every framework mentioned has a corresponding validated resource
□ Resource names are used as specified in the database (exact titles only)
□ Leader name matches EXACTLY with the validated leaders database
□ Leader reference uses the exact name and principle from the database
□ If no suitable validated leader exists for context, leader reference is omitted
□ Summary includes verified leader with working link in correct format (only if validated leader found)
□ All demographic context (role, industry, experience) is referenced appropriately
□ Summary contains exactly 2 distinct paragraphs with transition phrase
□ All competency names match exactly from assessment data
□ Each competency section has exactly 3 insights/advice items
□ Role-specific and industry-specific context is woven throughout

### CRITICAL JSON RULES
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- All arrays must contain only the specified data types.
- NEVER use resources not in the validated database - this is critical for link integrity
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- **PERSONALIZATION REQUIREMENT**: Use ALL THREE demographic dimensions (role, industry, experience) to tailor insights, examples, and leader selection for maximum relevance to the user's specific context.
- **VALIDATED RESOURCE REQUIREMENT**: Every resource in the resources arrays must be an exact match from the validated database above
- **VALIDATED LEADER REQUIREMENT**: Every leader in the summary must be an exact match from the validated leaders database above. If no suitable validated leader exists for the context, omit the leader reference entirely rather than using an unvalidated leader.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, and experience level. Remember: ONLY use resources and leaders from the validated databases with exact title matching.`;
};

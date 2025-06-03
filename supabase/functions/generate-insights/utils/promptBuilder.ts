
interface CategoryBreakdown {
  title: string;
  skillCount: number;
  averageCurrentRating: number;
  averageDesiredRating: number;
  gap: number;
  topGapSkills?: Array<{
    title: string;
    gap: number;
    currentRating: number;
    desiredRating: number;
  }>;
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
    
    // Calculate individual skill gaps and get top 2 largest gaps
    // FIXED: Ensure skill ratings are integers (no decimals for individual skills)
    const skillsWithGaps = validSkills.map(skill => ({
      title: skill.title,
      gap: skill.ratings.desired - skill.ratings.current,
      currentRating: Math.round(skill.ratings.current), // Ensure integer values
      desiredRating: Math.round(skill.ratings.desired)   // Ensure integer values
    })).sort((a, b) => b.gap - a.gap);
    
    const topGapSkills = skillsWithGaps.slice(0, 2);
    
    return {
      title: cat.title,
      skillCount: skillCount,
      averageCurrentRating: currentSum / skillCount,
      averageDesiredRating: desiredSum / skillCount,
      gap: (desiredSum / skillCount) - (currentSum / skillCount),
      topGapSkills: topGapSkills
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

// Validate and sanitize skill names for summary (remove any numbers or parentheses)
const validateSkillNamesForSummary = (skillNames: string[]): string[] => {
  return skillNames.map(skillName => {
    // Remove any patterns like "(gap: X.X)", "(current: X)", etc.
    const cleanedName = skillName.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Log any cleaning that occurred
    if (cleanedName !== skillName) {
      console.log(`SUMMARY SKILL CLEANUP: "${skillName}" -> "${cleanedName}"`);
    }
    
    return cleanedName;
  });
};

export const buildPrompt = (assessmentSummary: any): string => {
  console.log('PROMPT BUILDER: Starting prompt generation with assessment summary structure validation');
  
  // Validate assessment summary structure
  if (!assessmentSummary || !assessmentSummary.categoryBreakdown || !Array.isArray(assessmentSummary.categoryBreakdown)) {
    console.error('PROMPT BUILDER ERROR: Invalid assessment summary structure', assessmentSummary);
    throw new Error('Invalid assessment summary structure provided to prompt builder');
  }

  const topGapCategories = assessmentSummary.categoryBreakdown
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const topCompetencies = assessmentSummary.categoryBreakdown
    .filter(cat => cat.averageCurrentRating >= 3.5)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3);

  console.log('PROMPT BUILDER: Processing top gap categories for summary context');
  console.log('Top Gap Categories Count:', topGapCategories.length);
  console.log('Top Competencies Count:', topCompetencies.length);

  const assessmentDataSection = `
Assessment Data:
- Overall Average Gap: ${assessmentSummary.averageGap.toFixed(2)}
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'} years
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}

Top 3 Categories by Gap (Priority Development Areas):
${topGapCategories.map((cat, i) => {
  let categoryText = `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)} (Current: ${cat.averageCurrentRating.toFixed(1)}, Desired: ${cat.averageDesiredRating.toFixed(1)})`;
  
  if (cat.topGapSkills && cat.topGapSkills.length > 0) {
    categoryText += `\n   Top individual skill gaps:`;
    cat.topGapSkills.forEach((skill, skillIndex) => {
      categoryText += `\n   - ${skill.title}: Gap ${skill.gap.toFixed(1)} (Current: ${skill.currentRating}, Desired: ${skill.desiredRating})`;
    });
  }
  
  return categoryText;
}).join('\n\n')}

Top Competency Areas (High Current Ratings, Low Gaps):
${topCompetencies.map((cat, i) => {
  let categoryText = `${i+1}. ${cat.title}: Current ${cat.averageCurrentRating.toFixed(1)}, Gap ${cat.gap.toFixed(1)}`;
  
  if (cat.topGapSkills && cat.topGapSkills.length > 0) {
    categoryText += `\n   Individual skills within this competency:`;
    cat.topGapSkills.forEach((skill, skillIndex) => {
      categoryText += `\n   - ${skill.title}: Gap ${skill.gap.toFixed(1)} (Current: ${skill.currentRating}, Desired: ${skill.desiredRating})`;
    });
  }
  
  return categoryText;
}).join('\n\n')}
`;

  const validatedResourcesList = buildValidatedResourcesList();
  const validatedLeadersList = buildValidatedLeadersList();

  const fullPrompt = `${assessmentDataSection}

You are an expert leadership coach and assessment analyst. Based on the provided assessment data (including competency names, gap scores, individual skill gaps, and top competencies), generate AI insights for a user's leadership assessment.

### CRITICAL SKILL-LEVEL ANALYSIS REQUIREMENT

**MANDATORY SKILL-LEVEL INTEGRATION:**
- You MUST reference specific individual skills by name when discussing competencies
- In the SUMMARY ONLY: Reference skill names WITHOUT any numerical values (no gaps, no scores, no decimals, no numbers in parentheses)
- In INSIGHTS sections: Include specific skill names and their gap scores for targeted recommendations
- Tailor at least one suggestion or resource recommendation per priority area to address the specific skills with the largest gaps
- Use phrases like "particularly in areas such as [specific skill name]" in the summary
- In insights: Use "particularly in [specific skill name] (gap: X.X)" or "especially focusing on [skill name] where you have a gap of X.X"

**CRITICAL SUMMARY SKILL NAME VALIDATION:**
- NEVER include numbers, gap scores, current/desired ratings, or any parentheses after skill names in the summary
- ALWAYS validate that skill names in summary are clean and number-free
- Use only the skill name itself, such as "Strategic Planning" not "Strategic Planning (gap: 4.0)"
- If you reference skills in summary, use format: "particularly in areas such as [clean skill name] and [clean skill name]"

**Example Integration for Summary:**
Instead of: "Improve your decision making competency, particularly in Strategic Decision Making (gap: 4.0)"
Write: "Improve your decision making competency, particularly in areas such as Strategic Decision Making and Crisis Decision Making"

**Example Integration for Insights:**
Use: "Implement the OODA Loop to enhance your decision-making process, particularly in Strategic Decision Making (gap: 4.0) and Crisis Decision Making (gap: 3.5)"

### ENHANCED SUMMARY PERSONALIZATION REQUIREMENTS

**CRITICAL SUMMARY FORMATTING:**
- Reference the user's role (${assessmentSummary.demographics.role || 'leadership role'}) naturally throughout the summary
- Include industry context (${assessmentSummary.demographics.industry || 'your industry'}) where relevant
- Acknowledge their experience level (${assessmentSummary.demographics.yearsOfExperience || 'current'} years) appropriately
- Use encouraging, supportive language that builds confidence
- Avoid repetitive skill mentions or similar concepts
- Highlight 1-2 key skill names per competency for context (names only, NO numbers, NO gap scores, NO parentheses with values)
- Keep feedback clear, readable, and motivational

**Summary Personalization Examples:**
- "As a [role] in [industry] with [X] years of experience, your assessment shows..."
- "Your [X] years in [industry] have prepared you well for..."
- "In your role as [role], these competencies will be particularly valuable..."

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
4. **Skill-Specific**: Reference the individual skills with largest gaps by name and score

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
- MUST include specific skill names and gap scores when discussing competencies
- Avoid these generic phrases: "focus on," "work on improving," "consider developing"
- Instead use action-oriented language: "implement," "practice," "apply," "utilize"

**Skill-Level Integration Examples:**
✅ "Implement the SBI Feedback Model to enhance direct communication with your team, particularly focusing on Active Listening (gap: 3.5) and Difficult Conversations (gap: 4.0)"
✅ "Apply the Eisenhower Matrix for time management, especially targeting Project Planning (gap: 3.8) and Priority Setting (gap: 4.2)"

**Forbidden Generic Statements:**
❌ "Focus on improving communication skills"
✅ "Implement the SBI Feedback Model to enhance direct communication with your [role-specific context], particularly in Active Listening (gap: 3.5) where you can practice giving full attention during team meetings"

❌ "Work on building trust with your team"
✅ "Apply Speed of Trust behaviors by delivering results consistently, particularly focusing on Reliability (gap: 3.2) and Transparency (gap: 2.8) about [industry-specific challenges]"

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

- **summary**: Generate a professional, encouraging, and personalized assessment summary that is 6–8 sentences. Use the word "competencies" throughout (not "strengths"). Always refer to the person as "you" or "your" (never "the user" or "the user's"). MUST reference specific individual skills by NAME ONLY (NO numerical values, NO gaps, NO scores, NO decimals, NO parentheses with numbers) within the priority competencies. Include natural references to their role, industry, and experience level. Use supportive, confidence-building language while avoiding repetition.

**CRITICAL FORMATTING FOR SUMMARY**: Structure the summary as TWO clear paragraphs that will be separated by post-processing. Use transition phrases like "However," "At the same time," "Additionally," or "Your results also" to start the second paragraph. MUST include industry and role-relevant inspirational leader with working link using format: "Like [Leader Name](https://workinglink.com), who is known for [specific principle]..."

- **priority_areas**: An array with exactly 3 objects, each for a Top 3 Priority Development Area. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`gap\`: The numerical gap score
  - \`insights\`: Array of exactly 3 actionable, research-backed insights that avoid generic statements, include specific methodologies/frameworks, integrate role/industry/experience context, AND reference specific individual skills by name with their gap scores
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Concrete example of how this strength manifests in their specific role/industry context, including reference to specific skills within the competency
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this strength that incorporate role/industry/experience context and reference individual skills where relevant
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
□ **CRITICAL**: Summary references specific individual skills by NAME ONLY (NO numerical values, NO gaps, NO scores, NO decimals, NO parentheses)
□ **CRITICAL**: Insights reference specific individual skills by name and gap scores
□ **CRITICAL**: At least one insight per priority area addresses specific skills with largest gaps
□ **CRITICAL**: Summary uses encouraging, personalized language with role/industry/experience context
□ **CRITICAL**: Individual skill ratings are whole numbers (no decimals)

### CRITICAL JSON RULES
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- All arrays must contain only the specified data types.
- NEVER use resources not in the validated database - this is critical for link integrity
- NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice.
- Use only suggestive language for assessment tools: "consider using a tool such as [tool name]" rather than direct recommendations.
- **PERSONALIZATION REQUIREMENT**: Use ALL THREE demographic dimensions (role, industry, experience) to tailor insights, examples, and leader selection for maximum relevance to the user's specific context.
- **SKILL-LEVEL REQUIREMENT**: Reference specific individual skills by name only (NO numbers, NO gaps, NO scores) in summary, and by name with gap scores in priority area insights
- **VALIDATED RESOURCE REQUIREMENT**: Every resource in the resources arrays must be an exact match from the validated database above
- **VALIDATED LEADER REQUIREMENT**: Every leader in the summary must be an exact match from the validated leaders database above. If no suitable validated leader exists for the context, omit the leader reference entirely rather than using an unvalidated leader.

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, experience level, AND individual skill gaps. Remember: ONLY use resources and leaders from the validated databases with exact title matching, reference skills by name only in summary (NO numbers), and ALWAYS reference specific skills by name with their gap scores in insights sections.

`;

  // Log the complete prompt structure for debugging
  console.log('PROMPT BUILDER: Final prompt generated successfully');
  console.log('PROMPT BUILDER: Prompt length:', fullPrompt.length);
  console.log('PROMPT BUILDER: Assessment data validation complete');
  
  // Additional debugging for summary requirements
  console.log('PROMPT BUILDER: Summary requirements validation:');
  console.log('- Role specified:', assessmentSummary.demographics.role || 'Not specified');
  console.log('- Industry specified:', assessmentSummary.demographics.industry || 'Not specified');
  console.log('- Experience specified:', assessmentSummary.demographics.yearsOfExperience || 'Not specified');
  console.log('- Skills available for context reference:', topGapCategories.map(cat => 
    cat.topGapSkills ? cat.topGapSkills.map(skill => skill.title) : []
  ).flat());

  return fullPrompt;
};

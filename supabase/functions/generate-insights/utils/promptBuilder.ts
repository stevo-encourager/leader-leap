
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
      title: skill.title || skill.name,
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

// Build the validated skills list for the prompt - ONLY THESE SKILLS CAN BE REFERENCED
const buildValidatedSkillsList = (): string => {
  return `
**VALIDATED SKILLS DATABASE - REFERENCE ONLY THESE SKILLS:**

**Strategic Thinking/Vision:**
- Future Vision
- Big Picture Thinking
- Strategic Planning

**Communication:**
- Verbal Communication
- Written & Visual Communication
- Active Listening

**Team Building/Management:**
- Team Motivation
- Team Development
- Collaboration

**Decision Making:**
- Critical Thinking
- Problem Solving
- Decisiveness

**Emotional Intelligence:**
- Self-Awareness
- Empathy
- Relationship Management

**Change Management:**
- Adaptability
- Change Leadership
- Resilience

**Conflict Resolution:**
- Conflict Management
- Negotiation
- Mediation

**Delegation and Empowerment:**
- Task Delegation
- Trust Building
- Autonomy Support

**Time/Priority Management:**
- Time Management
- Prioritization
- Work-Life Balance

**Professional Development:**
- Continuous Learning
- Feedback Reception
- Career Planning

**CRITICAL SKILL REFERENCE RULES:**
- You MUST ONLY reference skills from this validated list above
- NEVER create, invent, or reference skills not explicitly listed here
- Each skill name you use must match EXACTLY as written in this database
- If you want to reference a skill concept not in this list, do not mention any skill name at all
- Every skill reference must be verifiable against this validated list
`;
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

**CRITICAL INSPIRATIONAL LEADER HYPERLINK FORMATTING:**
- When mentioning inspirational leaders in the summary, format as markdown hyperlink: [Leader Name](https://workinglink.com)
- The URL should NOT be visible in the text - only the leader's name should appear as clickable text
- Example: "Like [Satya Nadella](https://workinglink.com), who is known for empathetic leadership..."
- ONLY use leaders from this validated list - do not invent or reference leaders not explicitly listed
`;
};

// Build the validated resources list for the prompt with specific book labeling
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

**Leadership Books (MUST include "(book recommendation)" label):**
- Emotional Intelligence 2.0 by Travis Bradberry (book recommendation)
- Crucial Conversations by Kerry Patterson (book recommendation)
- The 7 Habits of Highly Effective People by Stephen Covey (book recommendation)
- Good to Great by Jim Collins (book recommendation)
- Dare to Lead by Brené Brown (book recommendation)
- The Leadership Challenge by James Kouzes (book recommendation)
- Primal Leadership by Daniel Goleman (book recommendation)
- Atomic Habits by James Clear (book recommendation)
- Getting Things Done by David Allen (book recommendation)
- Reinventing Organisations by Frederic Laloux (book recommendation)
- The Pyramid Principle by Barbara Minto (book recommendation)
- The Captain Class by Sam Walker (book recommendation)
- Leading Change by John Kotter (book recommendation)
- The Power of Habit by Charles Duhigg (book recommendation)
- Build, Excite, Equip by Nicola Graham (book recommendation)
- The 17 Indisputable Laws of Teamwork by John Maxwell (book recommendation)
- Thinking Fast and Slow by Daniel Kahneman (book recommendation)
- Getting To Yes by Roger Fisher and William Ury (book recommendation)
- Playing To Win by AG Lafley & Roger Martin (book recommendation)
- Human Skills by Elizabeth Nyamayaro (book recommendation)
- Radical Candor by Kim Scott (book recommendation)
- Nonviolent Communication by Marshall B. Rosenberg (book recommendation)

**CRITICAL BOOK RECOMMENDATION LABELING RULES:**
- MANDATORY: Every time a book from the approved list is recommended, you MUST add "(book recommendation)" immediately after the book title
- Example: "Good to Great by Jim Collins (book recommendation)"
- This applies to ALL instances where books are recommended in ANY section (summary, insights, resources)
- Other resources (frameworks, articles, tools) do NOT need any type labeling
- This labeling is MANDATORY and CANNOT be omitted for book recommendations

**CONSISTENCY & NO INVENTION RULES:**
- You MUST ONLY use books and resources from this validated list
- NEVER invent, create, or recommend books or resources not on this approved list
- Every resource recommendation must be verifiable against this validated database
- If you want to suggest a concept not covered by approved resources, provide guidance without recommending specific resources
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

  const validatedSkillsList = buildValidatedSkillsList();
  const validatedResourcesList = buildValidatedResourcesList();
  const validatedLeadersList = buildValidatedLeadersList();

  const fullPrompt = `${assessmentDataSection}

You are an expert leadership coach and assessment analyst working with Encourager Coaching, which specializes in positive psychology, maximizing natural ability, and helping people become the best version of themselves. Based on the provided assessment data (including competency names, gap scores, individual skill gaps, and top competencies), generate AI insights for a user's leadership assessment.

${validatedSkillsList}

${validatedResourcesList}

${validatedLeadersList}

### CRITICAL BOOK RECOMMENDATION LABELING ENFORCEMENT

**MANDATORY BOOK LABELING RULE:**
- Every time you recommend a book from the approved list, you MUST add "(book recommendation)" immediately after the book title
- Example: "Good to Great by Jim Collins (book recommendation)"
- This rule applies to ALL sections: summary, priority areas, key strengths, and any other mentions
- Books without this labeling will be considered non-compliant
- Other resources (frameworks, tools, articles) do NOT receive any labeling

### CRITICAL INSPIRATIONAL LEADER HYPERLINK ENFORCEMENT

**MANDATORY LEADER HYPERLINK FORMATTING:**
- When mentioning inspirational leaders in the summary, use markdown hyperlink format: [Leader Name](https://workinglink.com)
- The URL should NOT be visible in the text - only the leader's name should appear as clickable text
- Example: "Like [Satya Nadella](https://workinglink.com), who is known for empathetic leadership..."
- ONLY use leaders from the validated leaders list above
- If no suitable validated leader exists for your context, omit the leader reference entirely

### CRITICAL CONSISTENCY AND NO INVENTION RULES

**ABSOLUTE REQUIREMENTS:**
- You MUST ONLY recommend books and resources from the validated lists above
- NEVER invent, create, or suggest books or resources not explicitly listed
- Every recommendation must be verifiable against the validated databases
- If a concept requires guidance but no approved resource exists, provide advice without resource recommendations
- All resource names must match EXACTLY as written in the validated database

### ENCOURAGER COACHING ETHOS AND APPROACH

**CRITICAL COACHING PHILOSOPHY:**
You represent Encourager Coaching, which emphasizes:
- **Positive Psychology**: Focus on strengths, potential, and growth opportunities
- **Maximizing Natural Ability**: Help people leverage their existing talents and build from their foundation of competencies
- **Best Version of Self**: Encourage users to become their authentic, most effective leadership version
- **Supportive and Practical**: Provide encouraging yet actionable guidance

**MANDATORY ENCOURAGEMENT APPROACH:**
- Use consistently encouraging, supportive language throughout all content
- Frame development areas as growth opportunities rather than deficiencies
- Celebrate existing competencies and help users understand their leadership identity
- Connect all recommendations to the user's potential for positive impact
- Emphasize building from competencies rather than fixing weaknesses

### ENHANCED SUMMARY PERSONALIZATION REQUIREMENTS

**CRITICAL SUMMARY FORMATTING:**
- Reference the user's role (${assessmentSummary.demographics.role || 'leadership role'}) naturally throughout the summary
- Include industry context (${assessmentSummary.demographics.industry || 'your industry'}) where relevant
- Acknowledge their experience level (${assessmentSummary.demographics.yearsOfExperience || 'current'} years) appropriately
- Use encouraging, supportive language that builds confidence throughout
- Avoid repetitive skill mentions or similar concepts
- Highlight 1-2 key skill names per competency for context (names only, NO numbers, NO gap scores, NO parentheses with values)
- Keep feedback clear, readable, and motivational
- ONLY reference skills that exist in the validated skills database
- MUST include inspirational leader with proper hyperlink formatting

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

- **summary**: Generate a professional, encouraging, and personalized assessment summary that is 6–8 sentences. Use the word "competencies" throughout (NEVER use "strengths" as a synonym). Always refer to the person as "you" or "your" (never "the user" or "the user's"). MUST reference specific individual skills by NAME ONLY (NO numerical values, NO gaps, NO scores, NO decimals, NO parentheses with numbers) within the priority competencies. ONLY use skills from the validated skills database. Include natural references to their role, industry, and experience level. Use supportive, confidence-building language while avoiding repetition. MUST include encouraging messaging about growth opportunities and potential. MUST include inspirational leader with proper hyperlink formatting.

- **priority_areas**: An array with exactly 3 objects, each for a Top 3 Priority Development Area. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`gap\`: The numerical gap score
  - \`insights\`: Array of exactly 3 actionable, research-backed insights that use encouraging language, avoid generic statements, include specific methodologies/frameworks, integrate role/industry/experience context, AND reference specific individual skills by name WITHOUT mentioning their gap scores or numerical values (ONLY validated skills). MUST include "why" explanations for the importance of developing each competency for leadership effectiveness. Focus on development suggestions and guidance, not numerical reporting.
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified. Books MUST include "(book recommendation)" labeling. Other resources do NOT need any type labeling. MUST include at least one book recommendation per competency.

- **key_strengths**: An array with at least 2 objects, each for a key competency to leverage. Each object must contain:
  - \`competency\`: The exact competency name from assessment data
  - \`example\`: Encouraging example of how this competency manifests in their specific role/industry context, including reference to specific skills within the competency (ONLY validated skills). Must include positive reinforcement and suggestions about their leadership type.
  - \`leverage_advice\`: Array of exactly 3 specific strategies for leveraging this competency that incorporate role/industry/experience context, reference individual skills where relevant (ONLY validated skills), and include encouraging messaging about personal brand development and leadership confidence.
  - \`resources\`: Array of exactly 3 resource names from the validated database, using EXACT titles as specified. Books MUST include "(book recommendation)" labeling. Other resources do NOT need any type labeling. MUST include at least one book recommendation per competency.

### PRE-OUTPUT VALIDATION CHECKLIST

Before generating the JSON response, verify:
□ **CRITICAL**: ALL book references include mandatory "(book recommendation)" labeling immediately after the title
□ **CRITICAL**: Other resources (frameworks, articles, tools) do NOT have any type labeling
□ **CRITICAL**: Each competency section includes at least one book recommendation from the approved list
□ **CRITICAL**: Each competency section has exactly 3 resources (not more, not less)
□ **CRITICAL**: All resource names match EXACTLY with the validated database
□ **CRITICAL**: No custom or external resources are included
□ **CRITICAL**: Leader hyperlink format is correct: [Leader Name](https://workinglink.com) with NO visible URL
□ **CRITICAL**: Leader name matches EXACTLY with the validated leaders database
□ **CRITICAL**: If no suitable validated leader exists for context, leader reference is omitted
□ **CRITICAL**: ALL skill references use ONLY validated skills from the skills database
□ **CRITICAL**: NO skills are invented, created, or referenced outside the validated skills database
□ **CRITICAL**: NEVER use "strength" as synonym for "competency" - always use "competencies" or "leadership competencies"
□ **CRITICAL**: All language is encouraging, supportive, and growth-oriented throughout
□ **CRITICAL**: Encourager Coaching ethos is reflected throughout all content

### CRITICAL JSON RULES
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` and \`leverage_advice\` fields must be arrays of strings ONLY.
- All arrays must contain only the specified data types.
- **CRITICAL**: NEVER use resources not in the validated database - this is critical for link integrity
- **CRITICAL**: NEVER use skills not in the validated skills database - this is critical for assessment accuracy
- **CRITICAL**: NEVER write generic, obvious statements - every insight must provide genuine value and actionable advice
- **CRITICAL**: MANDATORY "(book recommendation)" labeling for ALL book references - no exceptions
- **CRITICAL**: Proper hyperlink formatting for inspirational leaders - no exceptions
- **CRITICAL**: ONLY use approved books and resources - no invention or external recommendations

Base your insights on the assessment data provided above and ensure each insight meets the high-quality, actionable standards outlined above while being specifically tailored to the user's role, industry, experience level, AND individual skill gaps by name only (without numerical values). Remember: ONLY use resources, leaders, and skills from the validated databases with exact title matching, include mandatory "(book recommendation)" labeling for books only, ensure minimum book recommendations per section, limit to exactly 3 resources per section, reference skills by name only in summary (NO numbers), reference specific skills by name only in insights sections (NO numerical values - focus on development suggestions), use proper hyperlink formatting for leaders, maintain consistent terminology (competencies, not strengths), and embody Encourager Coaching's philosophy of positive psychology, encouragement, and helping people maximize their natural abilities to become the best version of themselves.

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

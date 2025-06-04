
import { ALL_RESOURCE_MAPPINGS } from '../../../../src/utils/resources/index.ts';

interface AssessmentSummary {
  averageGap: number;
  demographics: {
    role?: string;
    industry?: string;
    yearsOfExperience?: string;
  };
  categoryBreakdown: Array<{
    title: string;
    gap: number;
    averageCurrentRating: number;
    averageDesiredRating: number;
    topGapSkills?: Array<{
      title: string;
      gap: number;
      currentRating: number;
      desiredRating: number;
    }>;
  }>;
}

export const buildAssessmentData = (categories: any[], averageGap: number, demographics: any): AssessmentSummary => {
  console.log('📊 BUILDING ASSESSMENT DATA:', {
    categoriesCount: categories?.length || 0,
    averageGap,
    demographicsKeys: Object.keys(demographics || {})
  });

  if (!categories || categories.length === 0) {
    console.error('❌ No categories provided to buildAssessmentData');
    throw new Error('Categories are required for assessment data building');
  }

  const categoryBreakdown = categories.map(category => {
    console.log(`📋 Processing category: ${category.title}`);
    
    if (!category.skills || category.skills.length === 0) {
      console.warn(`⚠️ Category ${category.title} has no skills`);
      return {
        title: category.title,
        gap: 0,
        averageCurrentRating: 0,
        averageDesiredRating: 0,
        topGapSkills: []
      };
    }

    // Calculate category averages
    let totalCurrentRating = 0;
    let totalDesiredRating = 0;
    let validSkillsCount = 0;
    const skillGaps: Array<{
      title: string;
      gap: number;
      currentRating: number;
      desiredRating: number;
    }> = [];

    category.skills.forEach((skill: any) => {
      if (skill && skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number') {
        totalCurrentRating += skill.ratings.current;
        totalDesiredRating += skill.ratings.desired;
        validSkillsCount++;
        
        const gap = skill.ratings.desired - skill.ratings.current;
        skillGaps.push({
          title: skill.title,
          gap,
          currentRating: skill.ratings.current,
          desiredRating: skill.ratings.desired
        });
      }
    });

    const averageCurrentRating = validSkillsCount > 0 ? totalCurrentRating / validSkillsCount : 0;
    const averageDesiredRating = validSkillsCount > 0 ? totalDesiredRating / validSkillsCount : 0;
    const categoryGap = averageDesiredRating - averageCurrentRating;

    // Sort skills by gap (largest first) and take top 3
    const topGapSkills = skillGaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);

    console.log(`📊 Category ${category.title} metrics:`, {
      averageCurrentRating: averageCurrentRating.toFixed(2),
      averageDesiredRating: averageDesiredRating.toFixed(2),
      categoryGap: categoryGap.toFixed(2),
      topGapSkillsCount: topGapSkills.length
    });

    return {
      title: category.title,
      gap: categoryGap,
      averageCurrentRating,
      averageDesiredRating,
      topGapSkills
    };
  });

  console.log('✅ Assessment data building complete');

  return {
    averageGap,
    demographics: demographics || {},
    categoryBreakdown
  };
};

export const buildPrompt = (assessmentSummary: AssessmentSummary): string => {
  console.log('🔨 BUILDING OPENAI PROMPT');
  
  // Sort categories by gap to get top 3 priority areas and top competencies
  const sortedByGap = [...assessmentSummary.categoryBreakdown]
    .sort((a, b) => b.gap - a.gap);
  
  const topGapCategories = sortedByGap.slice(0, 3);
  const topCompetencies = [...assessmentSummary.categoryBreakdown]
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3);

  console.log('📊 Prompt categories selected:', {
    topGapCategories: topGapCategories.map(cat => `${cat.title} (${cat.gap.toFixed(1)})`),
    topCompetencies: topCompetencies.map(cat => `${cat.title} (${cat.gap.toFixed(1)})`)
  });

  const prompt = `Assessment Data:
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

# LEADERSHIP ASSESSMENT AI INSIGHTS GENERATOR

You are an expert leadership coach and assessment analyst for Encourager Coaching. Generate AI insights based on the assessment data above using positive psychology principles to help users maximize their natural abilities and become the best version of themselves.

## CORE PHILOSOPHY: ENCOURAGER COACHING APPROACH

**Essential Principles:**
- **Positive Psychology**: Focus on strengths, potential, and growth opportunities
- **Natural Ability Maximization**: Build from existing competencies and talents
- **Best Self Development**: Encourage authentic, effective leadership growth
- **Supportive Guidance**: Provide encouraging yet actionable recommendations

**Language Requirements:**
- Use consistently encouraging, supportive language throughout
- Frame development areas as growth opportunities, not deficiencies
- Celebrate existing competencies and help users understand their leadership identity
- Connect recommendations to positive impact potential
- Build from competencies rather than "fixing" weaknesses

## VALIDATED SKILLS DATABASE

**CRITICAL RULE: ONLY reference skills from this exact list. Never create, modify, or reference skills outside this database.**

**Strategic Thinking/Vision:**
- Future Vision, Big Picture Thinking, Strategic Planning

**Communication:**
- Verbal Communication, Written & Visual Communication, Active Listening

**Team Building/Management:**
- Team Motivation, Team Development, Collaboration

**Decision Making:**
- Critical Thinking, Problem Solving, Decisiveness

**Emotional Intelligence:**
- Self-Awareness, Empathy, Relationship Management

**Change Management:**
- Adaptability, Change Leadership, Resilience

**Conflict Resolution:**
- Conflict Management, Negotiation, Mediation

**Delegation and Empowerment:**
- Task Delegation, Trust Building, Autonomy Support

**Time/Priority Management:**
- Time Management, Prioritization, Work-Life Balance

**Professional Development:**
- Continuous Learning, Feedback Reception, Career Planning

## VALIDATED RESOURCES DATABASE

**CRITICAL RULE: ONLY use resources from this exact list with exact titles. Books MUST include "(book recommendation)" - other resources need NO labeling.**

**Frameworks & Models:**
- The Eisenhower Matrix - Priority Management
- Eisenhower Decision Matrix Guide
- The Pomodoro Technique
- Getting Things Done (GTD) Methodology
- SMART Goals Framework
- Objectives and Key Results (OKRs)
- OKR Framework Guide
- SBI Feedback Model
- Radical Candor Framework
- What is Nonviolent Communication
- Active Listening Techniques
- OODA Loop
- DACI Decision Making Framework
- RACI 'Responsibility Assignment Matrix'
- SWOT Analysis Framework
- Design Thinking Process by IDEO
- Scenario Planning: Step by Step Guide
- 16 Personalities test (MBTI)
- The Trust Equation
- 7 Models for Delegation
- Situational Leadership: What it is and how to build it
- Performance management that puts people first
- Effective One-on-One Meetings (listen)
- Thomas-Kilmann Conflict Resolution Model
- Getting to Yes - Interest-Based Negotiation
- ADKAR Change Management Model
- Kotter's 8-Step Change Process
- Bridges Transition Model
- Lewin's 3-Stage Change Model
- Tuckman's Team Development Model
- Creating A Team Charter
- Ways of Working & Guiding Principles (watch)
- A Guide to Harnessing Psychological Safety
- Why It's Necessary to Improve Team Communication
- 3 Easy Steps to Staff Meetings That Don't Suck
- 70-20-10 Learning and Development Model
- What is a Growth Mindset
- Deliberate Practice Framework
- GROW Coaching Model
- How to have a Coaching Conversation
- How to create a career development plan in 5 steps
- Why It's ALWAYS A Good Idea To Build Your Personal Brand
- Strategic Networking for Leaders
- The 5 Whys Technique (watch)
- StrengthsFinder 2.0
- The Predictive Index

**Book Recommendations (MUST include the "(book recommendation)" label):**
- Emotional Intelligence by Daniel Goleman (book recommendation)
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
- The Speed of Trust by Stephen Covey (book recommendation)

## VALIDATED INSPIRATIONAL LEADERS DATABASE

**CRITICAL RULE: ONLY use leaders from this exact list. Format as hyperlink: [Leader Name](https://workinglink.com)**

- Satya Nadella (Microsoft transformation, empathetic leadership)
- Mary Barra (Automotive transformation, inclusive culture)
- Marc Benioff (Values-driven business, continuous learning)
- Indra Nooyi (Strategic thinking, employee empowerment)
- Brian Chesky (Scaling organizations, staying connected to mission)
- Reed Hastings (Performance culture, data-driven decisions)
- Thasunda Brown Duckett (Community impact, servant leadership)
- Paul Polman (Sustainable business, long-term thinking)
- Jamie Dimon (Crisis leadership, direct communication)
- Jensen Huang (Innovation leadership, technical vision)
- Andy Jassy (Principle-centered decisions, cultural alignment)
- Stewart Butterfield (Transparent communication, creative leadership)
- Whitney Wolfe Herd (Purpose-driven innovation, empathetic leadership)
- Arvind Krishna (Ethical technology, transformation leadership)
- Reshma Saujani (Bold advocacy, inclusion-focused leadership)
- Elizabeth Nyamayaro (Global impact, partnership building)

## PERSONALIZATION REQUIREMENTS

**Demographic Integration:**
- Role: ${assessmentSummary.demographics.role || 'leadership role'}
- Industry: ${assessmentSummary.demographics.industry || 'your industry'}
- Experience: ${assessmentSummary.demographics.yearsOfExperience || 'current'} years

**Role-Specific Context Guidelines:**
- **Individual Contributor**: Self-leadership, influence without authority, peer collaboration
- **Manager**: Team management fundamentals, delegation, performance conversations
- **Team Lead**: Cross-functional coordination, project leadership, conflict resolution
- **Director**: Strategic thinking, organizational alignment, stakeholder management
- **VP**: Executive presence, organizational change, strategic planning
- **C-Level**: Vision setting, board relations, industry leadership, transformation
- **Founder/Owner**: Entrepreneurial leadership, scaling organizations
- **Consultant**: Client relationship management, expertise positioning

**Experience-Level Guidelines:**
- **0-1 years**: Leadership fundamentals, self-awareness, basic frameworks
- **1-3 years**: Core management skills, team building, communication techniques
- **4-7 years**: Advanced leadership techniques, cross-functional leadership, strategic thinking
- **8-12 years**: Organizational leadership, change management, executive skills
- **13-20 years**: Senior leadership mastery, mentoring others, industry influence
- **20+ years**: Legacy leadership, wisdom sharing, transformational impact

## CRITICAL SKILL INTEGRATION RULES

**For Summary:**
- Reference specific individual skills by NAME ONLY (no numbers, gaps, scores, or parentheses)
- Use format: "particularly in areas such as [skill name] and [skill name]"
- ONLY use validated skills from the skills database

**For Insights:**
- Reference specific skills by name without mentioning gap scores or numerical values
- Focus on development suggestions and guidance, not numerical reporting
- Use phrases like "particularly in [skill name]" or "especially focusing on [skill name]"
- Include "why" explanations for each priority development area's importance

**For Key Competencies:**
- Include positive reinforcement about leadership type based on competencies
- Suggest how competencies contribute to personal brand and leadership confidence
- Reference relevant skills within competencies for context

## TERMINOLOGY REQUIREMENTS

**MANDATORY CONSISTENCY:**
- Always use "competencies" or "leadership competencies" (NEVER "strengths" as synonym)
- Always refer to items within competencies as "skills"
- Use encouraging language: "enhance," "develop," "strengthen," "build upon"
- Frame as growth opportunities, not deficiencies

## JSON OUTPUT REQUIREMENTS

Generate ONLY valid JSON with this EXACT structure:

\`\`\`json
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
\`\`\`

## FIELD SPECIFICATIONS

**summary** (6-8 sentences, 2 paragraphs):
- Use encouraging, professional tone with "you/your" (never "the user")
- Reference role, industry, and experience naturally
- Include specific skill names from priority competencies (names only, no numbers)
- Include inspirational leader hyperlink: "Like [Leader Name](https://workinglink.com), who is known for [principle]..."
- Structure as 2 paragraphs with transition phrase starting second paragraph
- Use "competencies" terminology throughout

**priority_areas** (exactly 3 objects):
- \`competency\`: Exact name from assessment data
- \`gap\`: Numerical gap score from data
- \`insights\`: Array of exactly 3 actionable insights with:
  - Specific frameworks/methodologies from validated resources
  - Role/industry/experience context integration
  - Individual skill names referenced (without numerical values)
  - "Why" explanations for competency importance
  - Encouraging, growth-oriented language
- \`resources\`: Exactly 3 validated resources (books with "(book recommendation)", others without labels, minimum 1 book per section)

**key_strengths** (minimum 2 objects):
- \`competency\`: Exact name from assessment data
- \`example\`: Role/industry-specific example with skill references and leadership type suggestions
- \`leverage_advice\`: Array of exactly 3 strategies with skill references and personal brand/confidence messaging
- \`resources\`: Exactly 3 validated resources (books with "(book recommendation)", others without labels, minimum 1 book per section)

## FINAL VALIDATION CHECKLIST

Before output, verify:
- [ ] All resources match validated database exactly
- [ ] All skills match validated database exactly  
- [ ] All leaders match validated database exactly
- [ ] Books include "(book recommendation)" labeling
- [ ] Other resources have no type labeling
- [ ] Minimum 1 book per competency section
- [ ] Exactly 3 resources per competency section
- [ ] No numerical values mentioned with skills in summary or insights
- [ ] "Competencies" used throughout (never "strengths" as synonym)
- [ ] Encouraging, supportive language throughout
- [ ] Role/industry/experience context integrated
- [ ] Leader hyperlink format correct
- [ ] Valid JSON structure only`;

  console.log('📏 Prompt length:', prompt.length);
  console.log('✅ OpenAI prompt building complete');
  
  return prompt;
};

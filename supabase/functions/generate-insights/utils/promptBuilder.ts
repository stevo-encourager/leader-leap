
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

  const prompt = `# Enhanced Leadership Assessment Analysis Prompt

You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting.

## Assessment Data Context:
- Overall Average Gap: ${assessmentSummary.averageGap.toFixed(2)}
- Role: ${assessmentSummary.demographics.role || 'Not specified'}
- Experience: ${assessmentSummary.demographics.yearsOfExperience || 'Not specified'}
- Industry: ${assessmentSummary.demographics.industry || 'Not specified'}

Top 3 Categories by Gap (Priority Development Areas):
${topGapCategories.map((cat, i) => `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)} (Current: ${cat.averageCurrentRating.toFixed(1)}, Desired: ${cat.averageDesiredRating.toFixed(1)})`).join('\n')}

Top Competency Areas (High Current Ratings, Low Gaps):
${topCompetencies.map((cat, i) => `${i+1}. ${cat.title}: Current ${cat.averageCurrentRating.toFixed(1)}, Gap ${cat.gap.toFixed(1)}`).join('\n')}

---

## CRITICAL REQUIREMENTS

### PERSONALIZATION MANDATE
You MUST deeply personalize every insight using ALL THREE demographic dimensions:

**Role-Specific Customization:**
- Individual Contributor: Self-leadership, influence without authority, peer collaboration
- Manager/Team Lead: Direct report management, delegation, performance coaching
- Director: Cross-functional leadership, strategic implementation, resource allocation
- VP/C-Level: Organizational strategy, culture transformation, stakeholder alignment
- Founder/Owner: Vision articulation, scaling leadership, investor/board relations
- Consultant: Client relationship mastery, thought leadership, project delivery

**Experience-Level Tailoring:**
- None/Less than 1 year: Leadership fundamentals, self-awareness, basic frameworks
- 1-3 years: Core management skills, team building, communication
- 4-7 years: Advanced leadership, cross-functional, strategic thinking  
- 8-12 years: Organizational leadership, change management, executive skills
- 13-20 years: Senior mastery, mentoring, industry impact
- 20+ years: Legacy leadership, wisdom sharing, transformation

**Industry-Specific Context:**
Reference specific challenges, terminology, and examples relevant to their industry. Use industry-specific language and terminology to establish credibility and relevance.

### INSIGHT QUALITY STANDARDS
**BANNED PHRASES** (Never use these generic terms):
- "Focus on improving"
- "Work on developing" 
- "Consider enhancing"
- "Try to build"
- "Think about"
- "It's important to..."
- "You should consider..."
- "Make sure to..."
- "Don't forget to..."
- "Be mindful of..."

**REQUIRED APPROACH:**
- Use specific action verbs: "Implement", "Practice", "Apply", "Execute", "Establish"
- Include concrete steps, not abstract concepts
- Reference specific frameworks, methodologies, or tools
- Provide context-specific workplace scenarios
- Address real challenges for their role/industry/experience

### RESOURCE LINKING REQUIREMENTS
1. **NO raw URLs anywhere in the response text**
2. **ALL links must use markdown format:** \`[Resource Name](URL)\`
3. **MANDATORY RESOURCE IDENTIFICATION:** After writing your insights, you MUST:
   - Review every insight in priority_areas and key_strengths
   - Identify EVERY framework, tool, methodology, technique, assessment, book, or system mentioned
   - Provide a corresponding resource in the recommended_resources section for each one
   - If you mention "DISC assessment," "360 feedback," "OKR framework," "Design thinking," "Good to Great," etc. - ALL must have resources
4. **WORKING LINKS ONLY:** Only include URLs you are absolutely confident are currently live and working
5. **Only include verified, authoritative sources** (official organizations, publishers, peer-reviewed sources, official book retailers)
6. **If you cannot find a verified, working link for any tool/technique/book, omit that item entirely from your insights**

### LEADER REFERENCES
When mentioning inspirational leaders, hyperlink their name to an official biography or professional profile:
- Format: \`[Leader Name](official-bio-url)\`
- **Selection Criteria:** Choose leaders who are:
  - Currently active or recently active (not historical figures from decades ago)
  - Specifically known for the competencies being highlighted
  - Relevant to their industry or role type
- Prefer company pages, university profiles, or verified professional sites over Wikipedia

---

## JSON STRUCTURE

\`\`\`json
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
      "relevance": "string"
    }
  ]
}
\`\`\`

## FIELD SPECIFICATIONS

### summary (6-8 sentences)
- **Always use "you/your" throughout**
- **Include the word "competencies" multiple times**
- **Structure:**
  - Paragraph 1: Distinctive competencies and leadership style, with hyperlinked industry leader example
  - Paragraph 2: Development opportunities with transition phrase, explaining contextual importance

### priority_areas (exactly 3 objects)
Each insight must:
- **Use exact competency names** from the assessment data (do not paraphrase)
- **Include implementation timelines:** "Over the next 30 days..." or "This week..."
- **Add measurement guidance:** How they'll know it's working or how to track progress
- **Anticipate obstacles:** Role/industry-specific challenges, not generic ones
- Provide step-by-step implementation guidance
- Include specific frameworks/methodologies/books (ensure these appear in recommended_resources)
- Use role/industry-specific examples with industry terminology
- Address practical implementation challenges
- Go beyond obvious advice with advanced techniques

### key_strengths (minimum 2 objects)  
- **competency:** Use exact competency names from the assessment data
- **example:** Must be highly specific to their role and industry context, including:
  - Specific metrics, outcomes, or measurable results
  - Actual workplace situations, not hypothetical scenarios
  - Industry-specific terminology and context
- **leverage_advice:** Three concrete strategies for maximizing these strengths, including:
  - **Implementation timelines:** When and how to apply these strategies
  - **Measurement guidance:** How to track the impact of leveraging these strengths
  - **Connection to development:** How to use these strengths to accelerate growth in weaker areas

### recommended_resources (comprehensive coverage)
- **CRITICAL REQUIREMENT:** You MUST include a resource for every single framework, tool, methodology, technique, assessment, book, or system mentioned anywhere in your priority_areas insights and key_strengths leverage_advice
- **RESOURCE DIVERSITY:** Provide a balanced mix of resource types (books, assessments, frameworks, tools, methodologies)
- **PROCESS:** After completing your insights, scan through them and create a resource for each mentioned item
- **EXAMPLES:** If you mention "360-degree feedback," "SMART goals," "emotional intelligence assessment," "servant leadership," "The 7 Habits of Highly Effective People," "Good to Great," etc. - each needs a resource
- **name:** Use exact official titles when possible - this will be hyperlinked to the URL
- **url:** MUST be a verified, currently working, authoritative link - no broken or placeholder URLs (for books, use official publisher or major retailer links)
- **relevance:** Which specific competency or framework this supports
- **QUALITY CONTROL:** If you cannot verify a working link exists, omit that item entirely from your insights

**Prioritized Resource Types:**
1. Official assessment tools and frameworks
2. Peer-reviewed research and business school resources  
3. Established leadership development organizations
4. Authoritative books by recognized experts
5. Professional certification programs

---

## VALIDATION CHECKLIST

Before finalizing your JSON response, verify:
- [ ] Every demographic dimension (role, industry, experience) is reflected in the content
- [ ] No generic or obvious advice - all insights are advanced and actionable
- [ ] **RESOURCE COMPLETENESS CHECK:** Every framework, tool, methodology, technique, assessment, book, or system mentioned in insights has a corresponding recommended resource
- [ ] All links use markdown format \`[Name](URL)\` with no raw URLs
- [ ] Leader references are hyperlinked to official sources
- [ ] All insights include concrete, context-specific examples
- [ ] **WORKING LINKS VERIFICATION:** All resource URLs are verified as currently working and authoritative
- [ ] JSON structure is exactly as specified
- [ ] **FINAL SCAN:** Re-read all insights and confirm every mentioned tool/technique appears in recommended_resources

**Remember:** Quality over quantity. Provide fewer, highly personalized insights rather than generic advice that could apply to anyone.`;

  return prompt;
};

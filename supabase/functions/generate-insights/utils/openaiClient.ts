
export const callOpenAI = async (prompt: string, openAIApiKey: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert leadership coach and assessment analyst with deep expertise in research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified in the user prompt. CRITICAL ENHANCED REQUIREMENTS: 1) PERSONALIZATION: Use ALL demographic data (role, industry, experience) to tailor every insight, example, and recommendation. 2) LINK AUTHORITY: Only reference authoritative, official sources - never use placeholder or unverified links. 3) INSIGHT QUALITY: Every insight must be actionable, specific, and provide genuine value beyond obvious advice. Reference concrete frameworks, research, or methodologies. 4) ROLE/INDUSTRY SPECIFICITY: Include workplace examples and scenarios relevant to their specific professional context. 5) EXPERIENCE-APPROPRIATE: Tailor complexity and focus areas to their leadership experience level. 6) INSPIRATIONAL LEADERS: Choose leaders relevant to their industry/role context who exemplify specific competencies. 7) RESOURCE VERIFICATION: Use exact approved resource titles when possible, ensure all mentioned frameworks have corresponding authoritative sources. 8) ASSESSMENT TOOL LANGUAGE: Use suggestive language only ("consider using") and limit to maximum ONE mention per assessment. 9) WRITING EXCELLENCE: Use action-oriented language, avoid generic statements, provide implementation steps. 10) STRUCTURE COMPLIANCE: Follow exact JSON structure with insights array containing EXACTLY 3 actionable insights (strings only), leverage_advice containing EXACTLY 3 pieces of advice (strings only), and summary formatted for paragraph splitting using transition phrases.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error: ${response.status} - ${errorText}`);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rawInsights = data.choices[0].message.content.trim();
  
  if (!rawInsights) {
    throw new Error('Empty response from OpenAI API');
  }

  console.log('Raw OpenAI response:', rawInsights);
  return rawInsights;
};

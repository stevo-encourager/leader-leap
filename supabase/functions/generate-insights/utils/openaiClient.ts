
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
          content: 'You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified in the user prompt. The insights array must contain ONLY strings, never objects or other keys. Use the word "competencies" throughout your response instead of "strengths". Always refer to the person as "you" or "your" (never "the user" or "the user\'s"). Structure your summary to be easily split into paragraphs using transition phrases. When recommending resources, use the exact titles provided in the prompt for consistency with our resource mapping system. CRITICAL: Every insight must be actionable, specific, and research-backed. Avoid generic statements that most people already know. Reference specific techniques, frameworks, research findings, or measurable outcomes whenever possible.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 3000
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

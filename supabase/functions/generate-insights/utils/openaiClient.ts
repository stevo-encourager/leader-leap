
// Model used when the OPENAI_MODEL secret is unset or blank.
const DEFAULT_OPENAI_MODEL = 'gpt-4o';

// Completion token ceiling used when OPENAI_MAX_TOKENS is unset or invalid.
const DEFAULT_MAX_TOKENS = 3000;

/**
 * Resolve the OpenAI model from the OPENAI_MODEL edge function secret,
 * falling back to DEFAULT_OPENAI_MODEL. Set with:
 *   supabase secrets set OPENAI_MODEL=<model-id>
 * A blank or whitespace-only secret is treated as unset so that clearing the
 * value falls back to the default rather than sending an empty model id.
 */
const resolveOpenAIModel = (): string => {
  const configured = Deno.env.get('OPENAI_MODEL')?.trim();
  return configured ? configured : DEFAULT_OPENAI_MODEL;
};

/**
 * Resolve the completion token ceiling from the OPENAI_MAX_TOKENS secret,
 * falling back to DEFAULT_MAX_TOKENS. Set with:
 *   supabase secrets set OPENAI_MAX_TOKENS=4000
 * Anything that is not a positive integer (blank, non-numeric, zero, negative,
 * fractional) falls back to the default rather than sending a value the API
 * would reject. Too low a ceiling truncates the JSON response mid-structure.
 */
const resolveMaxTokens = (): number => {
  const configured = Deno.env.get('OPENAI_MAX_TOKENS')?.trim();
  if (!configured) {
    return DEFAULT_MAX_TOKENS;
  }

  const parsed = Number(configured);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.warn(
      `Invalid OPENAI_MAX_TOKENS value "${configured}" - falling back to ${DEFAULT_MAX_TOKENS}`
    );
    return DEFAULT_MAX_TOKENS;
  }

  return parsed;
};

export const callOpenAI = async (prompt: string, openAIApiKey: string): Promise<string> => {
  const model = resolveOpenAIModel();
  const maxTokens = resolveMaxTokens();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified in the user prompt. CRITICAL RULES: 1) The insights array in priority_areas must contain EXACTLY 3 actionable insights (strings only, never objects). 2) The leverage_advice array in key_strengths must contain EXACTLY 3 actionable pieces of advice (strings only). 3) Never mix resource titles into insights arrays - keep resources separate in the resource field. 4) Use the word "competencies" throughout your response instead of "strengths". 5) Always refer to the person as "you" or "your" (never "the user" or "the user\'s"). 6) Structure your summary to be easily split into paragraphs using transition phrases. 7) When recommending resources, use the exact titles provided in the prompt for consistency with our resource mapping system. 8) Every insight and advice must be actionable, specific, and research-backed with concrete techniques or frameworks. 9) In your summary, identify patterns and connections between competency gaps (e.g., "Your gaps in delegation and team building suggest a need for more empowering leadership") rather than listing each gap separately.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const rawInsights = data.choices[0].message.content.trim();
  
  if (!rawInsights) {
    throw new Error('Empty response from OpenAI API');
  }

  return rawInsights;
};


export const callOpenAI = async (prompt: string, openAIApiKey: string): Promise<string> => {
  console.log('Calling OpenAI API with model: gpt-4o');
  console.log('Prompt length:', prompt.length);
  
  const requestBody = {
    model: 'gpt-4o',
    messages: [
      { 
        role: 'system', 
        content: 'You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified in the user prompt. CRITICAL RULES: 1) The insights array in priority_areas must contain EXACTLY 3 actionable insights (strings only, never objects). 2) The leverage_advice array in key_strengths must contain EXACTLY 3 actionable pieces of advice (strings only). 3) Never mix resource titles into insights arrays - keep resources separate in the resource field. 4) Use the word "competencies" throughout your response instead of "strengths". 5) Always refer to the person as "you" or "your" (never "the user" or "the user\'s"). 6) Structure your summary to be easily split into paragraphs using transition phrases. 7) When recommending resources, use the exact titles provided in the prompt for consistency with our resource mapping system. 8) Every insight and advice must be actionable, specific, and research-backed with concrete techniques or frameworks.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 3000
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI API response status:', response.status);
    console.log('OpenAI API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error details: ${response.status} - ${response.statusText}`);
      console.error('Error response body:', errorText);
      
      // Try to parse error response for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error JSON:', errorJson);
        
        if (errorJson.error && errorJson.error.message) {
          throw new Error(`OpenAI API error: ${errorJson.error.message}`);
        }
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response data structure:', {
      choices: data.choices?.length || 0,
      usage: data.usage,
      model: data.model
    });
    
    const rawInsights = data.choices[0].message.content.trim();
    
    if (!rawInsights) {
      throw new Error('Empty response from OpenAI API');
    }

    console.log('Raw OpenAI response length:', rawInsights.length);
    console.log('Raw OpenAI response preview:', rawInsights.substring(0, 200) + '...');
    
    return rawInsights;
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error connecting to OpenAI API. Please check your internet connection.');
    }
    
    throw error;
  }
};

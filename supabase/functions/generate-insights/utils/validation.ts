
export const validateEnvironmentVariables = () => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration not complete');
  }

  return { openAIApiKey, supabaseUrl, supabaseServiceKey };
};

export const validateInsightsStructure = (insights: any): void => {
  if (!insights.summary || !insights.priority_areas || !insights.key_strengths) {
    throw new Error('Invalid JSON structure - missing required fields: summary, priority_areas, or key_strengths');
  }
  
  if (!Array.isArray(insights.priority_areas) || !Array.isArray(insights.key_strengths)) {
    throw new Error('Invalid JSON structure - priority_areas and key_strengths must be arrays');
  }

  if (insights.priority_areas.length !== 3) {
    throw new Error('Invalid JSON structure - priority_areas must have exactly 3 items');
  }

  if (insights.key_strengths.length < 2) {
    throw new Error('Invalid JSON structure - key_strengths must have at least 2 items');
  }

  // Validate priority areas structure
  for (const area of insights.priority_areas) {
    if (!area.competency || !area.insights || !Array.isArray(area.insights) || area.insights.length !== 3 || !area.resource) {
      throw new Error('Invalid priority area structure - must have competency, gap, insights array with 3 strings, and resource');
    }
    
    for (const insight of area.insights) {
      if (typeof insight !== 'string') {
        throw new Error('Invalid priority area structure - insights array must contain only strings');
      }
    }
    
    if (typeof area.gap !== 'number') {
      throw new Error('Invalid priority area structure - gap must be a number');
    }
  }

  // Validate key strengths structure
  for (const strength of insights.key_strengths) {
    if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice) || strength.leverage_advice.length !== 3) {
      throw new Error('Invalid key strength structure - must have competency, example, and leverage_advice array with 3 strings');
    }
    
    for (const advice of strength.leverage_advice) {
      if (typeof advice !== 'string') {
        throw new Error('Invalid key strength structure - leverage_advice array must contain only strings');
      }
    }
  }
};

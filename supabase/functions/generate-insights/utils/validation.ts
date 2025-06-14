
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

  // Validate priority areas structure with updated resources validation
  for (const area of insights.priority_areas) {
    if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
      throw new Error('Invalid priority area structure - must have competency and insights array');
    }
    
    // Check that insights array has at least 2 items and at most 5 items
    if (area.insights.length < 2 || area.insights.length > 5) {
      throw new Error('Invalid priority area structure - insights array must have 2-5 items');
    }
    
    for (const insight of area.insights) {
      if (typeof insight !== 'string') {
        throw new Error('Invalid priority area structure - insights array must contain only strings');
      }
      
      // Check if insight looks like a resource title (very short, no actionable content)
      if (insight.length < 20) {
        throw new Error('Invalid priority area structure - insights must be actionable advice, not resource titles');
      }
    }
    
    if (typeof area.gap !== 'number') {
      throw new Error('Invalid priority area structure - gap must be a number');
    }

    // Handle both old 'resource' field and new 'resources' field for backward compatibility
    if (!area.resources && area.resource) {
      area.resources = [area.resource];
    }
    
    // Resources field is optional now, but if present must be an array
    if (area.resources && !Array.isArray(area.resources)) {
      throw new Error('Invalid priority area structure - resources must be an array');
    }
  }

  // Validate key strengths structure with updated resources validation  
  for (const strength of insights.key_strengths) {
    if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
      throw new Error('Invalid key strength structure - must have competency, example, and leverage_advice array');
    }
    
    // Check that leverage_advice array has at least 2 items and at most 5 items
    if (strength.leverage_advice.length < 2 || strength.leverage_advice.length > 5) {
      throw new Error('Invalid key strength structure - leverage_advice array must have 2-5 items');
    }
    
    for (const advice of strength.leverage_advice) {
      if (typeof advice !== 'string') {
        throw new Error('Invalid key strength structure - leverage_advice array must contain only strings');
      }
      
      // Check if advice looks actionable (not too short)
      if (advice.length < 15) {
        throw new Error('Invalid key strength structure - leverage advice must be actionable, not just titles');
      }
    }

    // Resources field is optional, but if present must be an array
    if (strength.resources && !Array.isArray(strength.resources)) {
      throw new Error('Invalid key strength structure - resources must be an array');
    }
  }
};

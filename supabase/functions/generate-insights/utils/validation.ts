
export const validateEnvironmentVariables = () => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  return { openAIApiKey, supabaseUrl, supabaseServiceKey };
};

export const validateInsightsStructure = (insights: any) => {
  console.log('Validating insights structure:', Object.keys(insights));
  
  if (!insights.summary || typeof insights.summary !== 'string') {
    throw new Error('Invalid insights structure - missing or invalid summary');
  }

  if (!insights.priority_areas || !Array.isArray(insights.priority_areas)) {
    throw new Error('Invalid insights structure - missing or invalid priority_areas array');
  }

  if (!insights.key_strengths || !Array.isArray(insights.key_strengths)) {
    throw new Error('Invalid insights structure - missing or invalid key_strengths array');
  }

  // Validate priority areas structure
  for (const area of insights.priority_areas) {
    if (!area.competency || typeof area.competency !== 'string') {
      throw new Error('Invalid priority area structure - missing or invalid competency');
    }
    
    if (!area.insights || !Array.isArray(area.insights)) {
      throw new Error('Invalid priority area structure - missing or invalid insights array');
    }
    
    if (typeof area.gap !== 'number') {
      throw new Error('Invalid priority area structure - missing or invalid gap number');
    }
    
    // Note: We don't require resource/resources fields in priority areas anymore
    // since they can be provided separately in recommended_resources
  }

  // Validate key strengths structure  
  for (const strength of insights.key_strengths) {
    if (!strength.competency || typeof strength.competency !== 'string') {
      throw new Error('Invalid key strength structure - missing or invalid competency');
    }
    
    if (!strength.example || typeof strength.example !== 'string') {
      throw new Error('Invalid key strength structure - missing or invalid example');
    }
    
    if (!strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
      throw new Error('Invalid key strength structure - missing or invalid leverage_advice array');
    }
  }

  // Optional: Validate recommended_resources if present
  if (insights.recommended_resources && Array.isArray(insights.recommended_resources)) {
    for (const resource of insights.recommended_resources) {
      if (!resource.name || typeof resource.name !== 'string') {
        throw new Error('Invalid recommended resource structure - missing or invalid name');
      }
      
      if (!resource.url || typeof resource.url !== 'string') {
        throw new Error('Invalid recommended resource structure - missing or invalid url');
      }
    }
  }

  console.log('Insights structure validation passed');
};

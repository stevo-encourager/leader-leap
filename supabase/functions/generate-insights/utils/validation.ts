
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
  console.log('🔍 VALIDATION: Starting comprehensive insights validation');
  
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

  // ENHANCED BOOK VALIDATION - Track all books found
  const validationResults = {
    priorityAreasBooks: [],
    keyStrengthsBooks: [],
    errors: []
  };

  console.log('🔍 VALIDATION: Checking priority areas for book compliance');
  
  // Validate priority areas structure with ULTRA-STRICT book recommendation validation
  for (const [index, area] of insights.priority_areas.entries()) {
    console.log(`🔍 VALIDATION: Checking priority area ${index + 1}: ${area.competency}`);
    
    if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
      const error = `Invalid priority area structure at index ${index} - must have competency and insights array`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }
    
    // Check that insights array has at least 2 items and at most 5 items
    if (area.insights.length < 2 || area.insights.length > 5) {
      const error = `Invalid priority area structure at index ${index} - insights array must have 2-5 items, found ${area.insights.length}`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }
    
    for (const insight of area.insights) {
      if (typeof insight !== 'string') {
        const error = `Invalid priority area structure at index ${index} - insights array must contain only strings`;
        console.error(`❌ VALIDATION ERROR: ${error}`);
        throw new Error(error);
      }
      
      // Check if insight looks like a resource title (very short, no actionable content)
      if (insight.length < 20) {
        const error = `Invalid priority area structure at index ${index} - insights must be actionable advice, not resource titles. Found: "${insight}"`;
        console.error(`❌ VALIDATION ERROR: ${error}`);
        throw new Error(error);
      }
    }
    
    if (typeof area.gap !== 'number') {
      const error = `Invalid priority area structure at index ${index} - gap must be a number`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }

    // Handle both old 'resource' field and new 'resources' field for backward compatibility
    if (!area.resources && area.resource) {
      area.resources = [area.resource];
    }
    
    // Resources field is required and must be an array
    if (!area.resources || !Array.isArray(area.resources)) {
      const error = `Invalid priority area structure at index ${index} - resources must be an array`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }

    console.log(`🔍 VALIDATION: Priority area ${index + 1} resources:`, area.resources);

    // ULTRA-STRICT BOOK RECOMMENDATION VALIDATION
    const bookRecommendations = area.resources.filter((resource: string) => 
      resource && resource.includes('(book recommendation)')
    );
    
    console.log(`🔍 VALIDATION: Found ${bookRecommendations.length} book(s) in priority area ${index + 1}:`, bookRecommendations);
    validationResults.priorityAreasBooks.push({
      areaIndex: index + 1,
      competency: area.competency,
      books: bookRecommendations,
      allResources: area.resources
    });
    
    if (bookRecommendations.length === 0) {
      const error = `CRITICAL VALIDATION FAILURE: Priority area ${index + 1} (${area.competency}) has NO book recommendations. Must have exactly 1.`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }
    
    if (bookRecommendations.length > 1) {
      const error = `CRITICAL VALIDATION FAILURE: Priority area ${index + 1} (${area.competency}) has ${bookRecommendations.length} book recommendations. Must have exactly 1. Found: ${bookRecommendations.join(', ')}`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }

    // Validate book recommendation format - MUST end with "(book recommendation)"
    const bookRec = bookRecommendations[0];
    if (!bookRec.endsWith('(book recommendation)')) {
      const error = `CRITICAL VALIDATION FAILURE: Priority area ${index + 1} book "${bookRec}" does not end with "(book recommendation)"`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }

    // Validate that it's not just "(book recommendation)" - must have actual title
    const titlePart = bookRec.replace(' (book recommendation)', '').trim();
    if (titlePart.length < 5) {
      const error = `CRITICAL VALIDATION FAILURE: Priority area ${index + 1} book recommendation has no valid title: "${bookRec}"`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }

    console.log(`✅ VALIDATION: Priority area ${index + 1} book validation PASSED: "${bookRec}"`);
  }

  console.log('🔍 VALIDATION: Checking key strengths for book compliance');

  // Validate key strengths structure with ULTRA-STRICT book recommendation validation  
  for (const [index, strength] of insights.key_strengths.entries()) {
    console.log(`🔍 VALIDATION: Checking key strength ${index + 1}: ${strength.competency}`);
    
    if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
      const error = `Invalid key strength structure at index ${index} - must have competency, example, and leverage_advice array`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }
    
    // Check that leverage_advice array has at least 2 items and at most 5 items
    if (strength.leverage_advice.length < 2 || strength.leverage_advice.length > 5) {
      const error = `Invalid key strength structure at index ${index} - leverage_advice array must have 2-5 items, found ${strength.leverage_advice.length}`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }
    
    for (const advice of strength.leverage_advice) {
      if (typeof advice !== 'string') {
        const error = `Invalid key strength structure at index ${index} - leverage_advice array must contain only strings`;
        console.error(`❌ VALIDATION ERROR: ${error}`);
        throw new Error(error);
      }
      
      // Check if advice looks actionable (not too short)
      if (advice.length < 15) {
        const error = `Invalid key strength structure at index ${index} - leverage advice must be actionable, not just titles. Found: "${advice}"`;
        console.error(`❌ VALIDATION ERROR: ${error}`);
        throw new Error(error);
      }
    }

    // Resources field is required and must be an array
    if (!strength.resources || !Array.isArray(strength.resources)) {
      const error = `Invalid key strength structure at index ${index} - resources must be an array`;
      console.error(`❌ VALIDATION ERROR: ${error}`);
      throw new Error(error);
    }

    console.log(`🔍 VALIDATION: Key strength ${index + 1} resources:`, strength.resources);

    // ULTRA-STRICT BOOK RECOMMENDATION VALIDATION
    const bookRecommendations = strength.resources.filter((resource: string) => 
      resource && resource.includes('(book recommendation)')
    );
    
    console.log(`🔍 VALIDATION: Found ${bookRecommendations.length} book(s) in key strength ${index + 1}:`, bookRecommendations);
    validationResults.keyStrengthsBooks.push({
      strengthIndex: index + 1,
      competency: strength.competency,
      books: bookRecommendations,
      allResources: strength.resources
    });
    
    if (bookRecommendations.length === 0) {
      const error = `CRITICAL VALIDATION FAILURE: Key strength ${index + 1} (${strength.competency}) has NO book recommendations. Must have exactly 1.`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }
    
    if (bookRecommendations.length > 1) {
      const error = `CRITICAL VALIDATION FAILURE: Key strength ${index + 1} (${strength.competency}) has ${bookRecommendations.length} book recommendations. Must have exactly 1. Found: ${bookRecommendations.join(', ')}`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }

    // Validate book recommendation format - MUST end with "(book recommendation)"
    const bookRec = bookRecommendations[0];
    if (!bookRec.endsWith('(book recommendation)')) {
      const error = `CRITICAL VALIDATION FAILURE: Key strength ${index + 1} book "${bookRec}" does not end with "(book recommendation)"`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }

    // Validate that it's not just "(book recommendation)" - must have actual title
    const titlePart = bookRec.replace(' (book recommendation)', '').trim();
    if (titlePart.length < 5) {
      const error = `CRITICAL VALIDATION FAILURE: Key strength ${index + 1} book recommendation has no valid title: "${bookRec}"`;
      console.error(`❌ ${error}`);
      validationResults.errors.push(error);
      throw new Error(error);
    }

    console.log(`✅ VALIDATION: Key strength ${index + 1} book validation PASSED: "${bookRec}"`);
  }

  // FINAL VALIDATION SUMMARY
  console.log('🔍 VALIDATION SUMMARY:');
  console.log('📚 Priority Areas Books:', validationResults.priorityAreasBooks);
  console.log('📚 Key Strengths Books:', validationResults.keyStrengthsBooks);
  
  if (validationResults.errors.length > 0) {
    console.error('❌ VALIDATION FAILED with errors:', validationResults.errors);
    throw new Error(`Validation failed: ${validationResults.errors.join('; ')}`);
  }

  console.log('✅ VALIDATION: All book recommendation requirements PASSED');
  console.log('✅ VALIDATION: Structure validation COMPLETE - insights are compliant');
};

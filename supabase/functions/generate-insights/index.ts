
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Consolidated utility functions

const validateEnvironmentVariables = () => {
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

const validateInsightsStructure = (insights: any): void => {
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

  // Validate priority areas structure
  for (const [index, area] of insights.priority_areas.entries()) {
    if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
      throw new Error(`Invalid priority area structure at index ${index} - must have competency and insights array`);
    }
    
    if (area.insights.length < 2 || area.insights.length > 5) {
      throw new Error(`Invalid priority area structure at index ${index} - insights array must have 2-5 items, found ${area.insights.length}`);
    }
    
    for (const insight of area.insights) {
      if (typeof insight !== 'string') {
        throw new Error(`Invalid priority area structure at index ${index} - insights array must contain only strings`);
      }
    }
    
    if (typeof area.gap !== 'number') {
      throw new Error(`Invalid priority area structure at index ${index} - gap must be a number`);
    }

    if (!area.resources && area.resource) {
      area.resources = [area.resource];
    }
    
    if (!area.resources || !Array.isArray(area.resources)) {
      throw new Error(`Invalid priority area structure at index ${index} - resources must be an array`);
    }
  }

  // Validate key strengths structure
  for (const [index, strength] of insights.key_strengths.entries()) {
    if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
      throw new Error(`Invalid key strength structure at index ${index} - must have competency, example, and leverage_advice array`);
    }
    
    if (strength.leverage_advice.length < 2 || strength.leverage_advice.length > 5) {
      throw new Error(`Invalid key strength structure at index ${index} - leverage_advice array must have 2-5 items, found ${strength.leverage_advice.length}`);
    }
    
    for (const advice of strength.leverage_advice) {
      if (typeof advice !== 'string') {
        throw new Error(`Invalid key strength structure at index ${index} - leverage_advice array must contain only strings`);
      }
    }

    if (!strength.resources || !Array.isArray(strength.resources)) {
      throw new Error(`Invalid key strength structure at index ${index} - resources must be an array`);
    }
  }

  console.log('✅ VALIDATION: Structure validation COMPLETE - insights are compliant');
};

const cleanJsonResponse = (response: string): string => {
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
  
  return cleaned.trim();
};

const formatSummaryIntoParagraphs = (summary: string): string => {
  if (!summary || summary.trim().length === 0) {
    return "";
  }

  let formatted = summary.replace(/\s+/g, ' ').trim();
  
  const transitionPhrases = [
    'However,', 'At the same time,', 'Additionally,', 'Furthermore,', 'Moreover,',
    'Nevertheless,', 'On the other hand,', 'Meanwhile,', 'In contrast,', 'Similarly,',
    'Consequently,', 'Therefore,', 'Thus,', 'As a result,', 'In addition,',
    'Your results also', 'Your assessment also', 'These results', 'This assessment',
    'Conversely,', 'Nonetheless,', 'Likewise,', 'Subsequently,', 'Alternatively,'
  ];
  
  for (const phrase of transitionPhrases) {
    const phraseIndex = formatted.indexOf(phrase);
    if (phraseIndex > 50) {
      const firstPart = formatted.substring(0, phraseIndex).trim();
      const secondPart = formatted.substring(phraseIndex).trim();
      
      if (firstPart.length > 30 && secondPart.length > 30) {
        console.log(`Split summary using transition phrase: "${phrase}"`);
        return `${firstPart}\n\n${secondPart}`;
      }
    }
  }
  
  const sentences = formatted.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  if (sentences.length >= 4) {
    const midPoint = Math.ceil(sentences.length * 0.6);
    const firstParagraph = sentences.slice(0, midPoint).join(' ').trim();
    const secondParagraph = sentences.slice(midPoint).join(' ').trim();
    
    console.log(`Split summary by sentence count: ${sentences.length} sentences, split at ${midPoint}`);
    return `${firstParagraph}\n\n${secondParagraph}`;
  }
  
  console.log('Summary too short to split, returning as single paragraph');
  return formatted;
};

const sanitizeJsonString = (jsonString: string): string => {
  console.log('Starting JSON sanitization, original length:', jsonString.length);
  
  try {
    JSON.parse(jsonString);
    console.log('JSON parsing successful on first attempt');
    return jsonString;
  } catch (error) {
    console.log('JSON parsing failed, attempting to sanitize control characters:', error.message);
    
    let sanitized = '';
    let insideString = false;
    let escapeNext = false;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      const charCode = char.charCodeAt(0);
      
      if (escapeNext) {
        sanitized += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        sanitized += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        insideString = !insideString;
        sanitized += char;
        continue;
      }
      
      if (insideString && charCode >= 0 && charCode <= 31) {
        switch (charCode) {
          case 8:
            sanitized += '\\b';
            break;
          case 9:
            sanitized += '\\t';
            break;
          case 10:
            sanitized += '\\n';
            break;
          case 12:
            sanitized += '\\f';
            break;
          case 13:
            sanitized += '\\r';
            break;
          default:
            const hex = charCode.toString(16).padStart(4, '0');
            sanitized += `\\u${hex}`;
            break;
        }
      } else {
        sanitized += char;
      }
    }
    
    console.log('Control character sanitization completed, new length:', sanitized.length);
    
    try {
      JSON.parse(sanitized);
      console.log('JSON sanitization successful');
      return sanitized;
    } catch (secondError) {
      console.error('JSON sanitization failed:', secondError.message);
      throw new Error(`Unable to parse JSON after sanitization: ${secondError.message}`);
    }
  }
};

const callOpenAI = async (prompt: string, openAIApiKey: string): Promise<string> => {
  console.log('🔍 CALLING OPENAI API...');
  console.log('🔍 PROMPT LENGTH:', prompt.length);
  console.log('🔍 PROMPT PREVIEW:', prompt.substring(0, 500) + '...');
  
  try {
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
            content: 'You are an expert leadership coach and assessment analyst with deep knowledge of research-backed leadership development strategies. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified in the user prompt. CRITICAL RULES: 1) The insights array in priority_areas must contain EXACTLY 3 actionable insights (strings only, never objects). 2) The leverage_advice array in key_strengths must contain EXACTLY 3 actionable pieces of advice (strings only). 3) Never mix resource titles into insights arrays - keep resources separate in the resource field. 4) Use the word "competencies" throughout your response instead of "strengths". 5) Always refer to the person as "you" or "your" (never "the user" or "the user\'s"). 6) Structure your summary to be easily split into paragraphs using transition phrases. 7) When recommending resources, use the exact titles provided in the prompt for consistency with our resource mapping system. 8) Every insight and advice must be actionable, specific, and research-backed with concrete techniques or frameworks.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 3000
      }),
    });

    console.log('🔍 OPENAI RESPONSE STATUS:', response.status);
    console.log('🔍 OPENAI RESPONSE OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 OPENAI RESPONSE DATA STRUCTURE:', Object.keys(data));
    console.log('🔍 OPENAI CHOICES LENGTH:', data.choices?.length || 0);
    
    const rawInsights = data.choices[0].message.content.trim();
    
    if (!rawInsights) {
      throw new Error('Empty response from OpenAI API');
    }

    console.log('🔍 RAW OPENAI RESPONSE LENGTH:', rawInsights.length);
    console.log('🔍 RAW OPENAI RESPONSE PREVIEW:', rawInsights.substring(0, 200) + '...');
    return rawInsights;
  } catch (error) {
    console.error('🔍 OPENAI API CALL FAILED:', error);
    throw error;
  }
};

const buildPrompt = (assessmentSummary: any): string => {
  console.log('🔍 PROMPT BUILDER: Building prompt with assessment data');
  console.log('🔍 PROMPT BUILDER: Categories count:', assessmentSummary.categoryBreakdown?.length || 0);
  console.log('🔍 PROMPT BUILDER: Average gap:', assessmentSummary.averageGap);
  
  // Sort categories by gap to identify highest and lowest gaps
  const sortedByGap = [...assessmentSummary.categoryBreakdown].sort((a, b) => b.gap - a.gap);
  const highestGapCategories = sortedByGap.slice(0, 3);
  const lowestGapCategories = sortedByGap.slice(-3).reverse();
  
  console.log('🔍 PROMPT BUILDER: Highest gap categories:', highestGapCategories.map(c => `${c.title}: ${c.gap}`));
  console.log('🔍 PROMPT BUILDER: Lowest gap categories:', lowestGapCategories.map(c => `${c.title}: ${c.gap}`));
  
  const prompt = `
You are EncouragerGPT, an AI leadership development coach specializing in personalized assessment analysis and development recommendations.

CRITICAL INSTRUCTIONS FOR DATA USAGE:
- You MUST use the EXACT category titles and gap values provided below
- You MUST select priority areas from the HIGHEST gap categories listed
- You MUST select key strengths from the LOWEST gap categories listed
- Generate insights in VALID JSON format only
- Include specific, actionable advice
- Personalize based on the demographic information provided

ASSESSMENT RESULTS TO ANALYZE:
Average Gap Across All Categories: ${assessmentSummary.averageGap.toFixed(2)}

CATEGORY BREAKDOWN (SORTED BY GAP SIZE):
HIGHEST GAPS (Development Priorities):
${highestGapCategories.map((cat, index) => 
  `${index + 1}. "${cat.title}" - Gap: ${cat.gap.toFixed(2)}`
).join('\n')}

LOWEST GAPS (Key Strengths):
${lowestGapCategories.map((cat, index) => 
  `${index + 1}. "${cat.title}" - Gap: ${cat.gap.toFixed(2)}`
).join('\n')}

ALL CATEGORIES FOR REFERENCE:
${assessmentSummary.categoryBreakdown.map((cat, index) => 
  `${index + 1}. "${cat.title}" - Gap: ${cat.gap.toFixed(2)}`
).join('\n')}

DEMOGRAPHICS INFORMATION:
- Role: ${assessmentSummary.demographics.role || 'Not provided'}
- Industry: ${assessmentSummary.demographics.industry || 'Not provided'}  
- Experience: ${assessmentSummary.demographics.experience || 'Not provided'}
- Team Size: ${assessmentSummary.demographics.teamSize || 'Not provided'}

MANDATORY SELECTION RULES:
PRIORITY AREAS: You MUST select the 3 categories with the HIGHEST gaps from the data above:
1. "${highestGapCategories[0]?.title}" (Gap: ${highestGapCategories[0]?.gap.toFixed(2)})
2. "${highestGapCategories[1]?.title}" (Gap: ${highestGapCategories[1]?.gap.toFixed(2)})
3. "${highestGapCategories[2]?.title}" (Gap: ${highestGapCategories[2]?.gap.toFixed(2)})

KEY STRENGTHS: You MUST select 2-3 categories with the LOWEST gaps from the data above:
1. "${lowestGapCategories[0]?.title}" (Gap: ${lowestGapCategories[0]?.gap.toFixed(2)})
2. "${lowestGapCategories[1]?.title}" (Gap: ${lowestGapCategories[1]?.gap.toFixed(2)})

PERSONALIZATION REQUIREMENTS:
${assessmentSummary.demographics.role ? `- Provide role-specific advice for: ${assessmentSummary.demographics.role}` : '- Use general leadership advice (no role specified)'}
${assessmentSummary.demographics.industry ? `- Include industry-specific examples for: ${assessmentSummary.demographics.industry}` : '- Use general industry examples (no industry specified)'}
${assessmentSummary.demographics.experience ? `- Tailor complexity for experience level: ${assessmentSummary.demographics.experience}` : '- Use general experience level advice (no experience specified)'}
${assessmentSummary.demographics.teamSize ? `- Consider team size of: ${assessmentSummary.demographics.teamSize}` : '- Use general team considerations (no team size specified)'}

SUMMARY REQUIREMENTS:
Create a two-paragraph summary that:
- References the actual average gap of ${assessmentSummary.averageGap.toFixed(2)}
- Mentions specific category strengths and development areas by name
- Uses transition phrases like "Additionally, your assessment reveals..." or "Furthermore, the data suggests..."
- Acknowledges missing demographic information when applicable

OUTPUT STRUCTURE:
Generate a JSON response with this exact structure:

{
  "summary": "Two-paragraph personalized summary referencing the specific assessment data and gaps",
  "priority_areas": [
    {
      "competency": "${highestGapCategories[0]?.title}",
      "gap": ${highestGapCategories[0]?.gap},
      "insights": [
        "Specific actionable insight 1 for this competency",
        "Specific actionable insight 2 for this competency", 
        "Specific actionable insight 3 for this competency"
      ],
      "resources": [
        "Resource 1",
        "Resource 2",
        "Resource 3"
      ]
    },
    {
      "competency": "${highestGapCategories[1]?.title}",
      "gap": ${highestGapCategories[1]?.gap},
      "insights": [
        "Specific actionable insight 1 for this competency",
        "Specific actionable insight 2 for this competency", 
        "Specific actionable insight 3 for this competency"
      ],
      "resources": [
        "Resource 1",
        "Resource 2",
        "Resource 3"
      ]
    },
    {
      "competency": "${highestGapCategories[2]?.title}",
      "gap": ${highestGapCategories[2]?.gap},
      "insights": [
        "Specific actionable insight 1 for this competency",
        "Specific actionable insight 2 for this competency", 
        "Specific actionable insight 3 for this competency"
      ],
      "resources": [
        "Resource 1",
        "Resource 2",
        "Resource 3"
      ]
    }
  ],
  "key_strengths": [
    {
      "competency": "${lowestGapCategories[0]?.title}",
      "example": "Specific example of how this strength manifests based on the low gap of ${lowestGapCategories[0]?.gap.toFixed(2)}",
      "leverage_advice": [
        "Specific advice 1 for leveraging this strength",
        "Specific advice 2 for leveraging this strength"
      ],
      "resources": [
        "Resource 1",
        "Resource 2"
      ]
    },
    {
      "competency": "${lowestGapCategories[1]?.title}",
      "example": "Specific example of how this strength manifests based on the low gap of ${lowestGapCategories[1]?.gap.toFixed(2)}",
      "leverage_advice": [
        "Specific advice 1 for leveraging this strength",
        "Specific advice 2 for leveraging this strength"
      ],
      "resources": [
        "Resource 1",
        "Resource 2"
      ]
    }
  ]
}

VALIDATION REQUIREMENTS:
- Use ONLY the exact category titles provided above
- Use ONLY the exact gap values provided above
- Reference the specific assessment data in your summary
- Provide actionable, specific insights (not generic advice)
- Acknowledge when demographic information is missing

Generate the JSON response now using the specific assessment data provided above.`;

  console.log('🔍 PROMPT BUILDER: Completed prompt construction, length:', prompt.length);
  return prompt;
};

const buildAssessmentData = (
  categories: any[],
  averageGap: number,
  demographics: any
): any => {
  console.log('🔍 BUILD ASSESSMENT DATA: Input categories count:', categories?.length || 0);
  console.log('🔍 BUILD ASSESSMENT DATA: Input averageGap:', averageGap);
  console.log('🔍 BUILD ASSESSMENT DATA: Input demographics keys:', Object.keys(demographics || {}));

  // CRITICAL FIX: Use the gap values that are already calculated and sent from the frontend
  // DO NOT recalculate or default to 0 - this was causing all gaps to be 0
  const categoryBreakdown = categories.map((category: any) => {
    console.log('🔍 BUILD ASSESSMENT DATA: Processing category:', category.title, 'with gap:', category.gap);
    return {
      title: category.title,
      gap: category.gap, // Use the exact gap value sent from frontend
    };
  });

  const assessmentData = {
    demographics: {
      role: demographics?.role || null,
      industry: demographics?.industry || null,
      experience: demographics?.experience || null,
      teamSize: demographics?.teamSize || null,
    },
    averageGap: averageGap,
    categoryBreakdown: categoryBreakdown,
  };

  console.log('🔍 BUILD ASSESSMENT DATA: Final assessment data created');
  console.log('🔍 BUILD ASSESSMENT DATA: Category breakdown count:', categoryBreakdown.length);
  console.log('🔍 BUILD ASSESSMENT DATA: Sample categories with actual gaps:', categoryBreakdown.slice(0, 3));
  return assessmentData;
};

const checkExistingInsights = async (
  assessmentId: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string,
  forceRegenerate: boolean = false
): Promise<string | null> => {
  console.log('🔍 DATABASE: Checking for existing insights:', {
    assessmentId,
    forceRegenerate
  });

  // CRITICAL FIX: If forceRegenerate is true, always return null to generate new insights
  if (forceRegenerate) {
    console.log('🔍 DATABASE: forceRegenerate=true - Skipping existing insights check and forcing new generation');
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: assessment, error } = await supabase
      .from('assessment_results')
      .select('ai_insights')
      .eq('id', assessmentId)
      .single();

    if (error) {
      console.log('🔍 DATABASE: Error checking for existing insights:', error);
      return null;
    }

    if (assessment && 
        assessment.ai_insights && 
        assessment.ai_insights.trim() !== '' &&
        assessment.ai_insights.trim() !== 'null' &&
        assessment.ai_insights.trim() !== 'undefined') {
      
      console.log('🔍 DATABASE: Found existing insights, returning saved version');
      return assessment.ai_insights;
    }

    console.log('🔍 DATABASE: No existing insights found - generating new insights');
    return null;
    
  } catch (error) {
    console.error('🔍 DATABASE: Error in checkExistingInsights:', error);
    return null;
  }
};

const saveInsights = async (
  assessmentId: string, 
  insights: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string
): Promise<void> => {
  console.log('🔍 DATABASE: Saving insights for assessment:', assessmentId);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('assessment_results')
      .update({ ai_insights: insights })
      .eq('id', assessmentId);

    if (error) {
      console.error('🔍 DATABASE: Error saving insights:', error);
      throw new Error(`Failed to save insights: ${error.message}`);
    }

    console.log('🔍 DATABASE: Successfully saved insights');
  } catch (error) {
    console.error('🔍 DATABASE: Error in saveInsights:', error);
    throw error;
  }
};

// Main function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 === GENERATE INSIGHTS FUNCTION START ===');
    
    // Validate environment variables
    const { openAIApiKey, supabaseUrl, supabaseServiceKey } = validateEnvironmentVariables();
    console.log('🔍 Environment variables validated successfully');

    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error('🔍 CRITICAL ERROR: Invalid JSON in request body:', e);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 REQUEST BODY RECEIVED:', {
      categoriesLength: requestBody.categories?.length || 0,
      hasDemo: !!requestBody.demographics,
      averageGap: requestBody.averageGap,
      assessmentId: requestBody.assessmentId || 'undefined (test mode)',
      forceRegenerate: requestBody.forceRegenerate,
      forceRegenerateType: typeof requestBody.forceRegenerate
    });

    const { categories, demographics, averageGap, assessmentId, forceRegenerate } = requestBody;

    // Validate required inputs
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error('🔍 CRITICAL ERROR: Missing or invalid categories in request body');
      return new Response(JSON.stringify({ 
        error: "Missing or invalid 'categories' array in request body. Categories are required for insight generation." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof averageGap !== 'number') {
      console.error('🔍 CRITICAL ERROR: Missing or invalid averageGap in request body');
      return new Response(JSON.stringify({ 
        error: "Missing or invalid 'averageGap' number in request body. Average gap is required for insight generation." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Allow assessmentId to be undefined for test scenarios
    if (assessmentId !== undefined && (typeof assessmentId !== 'string' || assessmentId.trim() === '')) {
      console.error('🔍 CRITICAL ERROR: Invalid assessmentId in request body - must be string or undefined');
      return new Response(JSON.stringify({ 
        error: "Invalid 'assessmentId' in request body. Assessment ID must be a non-empty string or undefined for test scenarios." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 INPUT VALIDATION PASSED:', {
      categoriesCount: categories.length,
      hasDemo: !!demographics,
      averageGap: averageGap,
      assessmentId: assessmentId || 'undefined (test mode)',
      forceRegenerate: forceRegenerate,
      willForceRegenerate: !!forceRegenerate
    });

    // Check for existing insights only if we have an assessmentId
    if (assessmentId) {
      console.log('🔍 CHECKING FOR EXISTING INSIGHTS WITH FORCE FLAG:', {
        assessmentId,
        forceRegenerate,
        willBypassExistingCheck: !!forceRegenerate
      });
      
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey, forceRegenerate);
      
      console.log('🔍 DATABASE CHECK RESULT:', {
        hasExistingInsights: !!existingInsights,
        existingInsightsLength: existingInsights?.length || 0,
        willReturnExisting: !!existingInsights,
        forceRegenerateFlag: forceRegenerate
      });
      
      if (existingInsights) {
        console.log('🔍 RETURNING EXISTING INSIGHTS - No generation needed');
        return new Response(JSON.stringify({ insights: existingInsights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('🔍 NO EXISTING INSIGHTS OR FORCE REGENERATE - Proceeding with generation');
    } else {
      console.log('🔍 TEST MODE: No assessmentId provided - generating insights for testing');
    }

    // Build assessment data and prompt with enhanced logging
    console.log('🔍 BUILDING ASSESSMENT DATA AND PROMPT...');
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    
    console.log('🔍 ASSESSMENT SUMMARY BUILT:', {
      demographicsKeys: Object.keys(assessmentSummary.demographics),
      averageGap: assessmentSummary.averageGap,
      categoryCount: assessmentSummary.categoryBreakdown.length,
      topCategories: assessmentSummary.categoryBreakdown.slice(0, 3).map(cat => `${cat.title}: ${cat.gap}`)
    });
    
    const prompt = buildPrompt(assessmentSummary);
    console.log('🔍 PROMPT BUILT - Length:', prompt.length);

    // Retry logic for validation failures
    const MAX_RETRIES = 3;
    let attempt = 1;
    let finalInsights: string | null = null;

    while (attempt <= MAX_RETRIES && !finalInsights) {
      console.log(`🔍 GENERATION ATTEMPT ${attempt}/${MAX_RETRIES} ${forceRegenerate ? '(FORCE REGENERATE)' : ''}`);
      
      try {
        // Call OpenAI
        const rawInsights = await callOpenAI(prompt, openAIApiKey);
        console.log('🔍 OPENAI RESPONSE RECEIVED - Length:', rawInsights.length);

        // Clean and parse the response
        console.log('🔍 CLEANING AND PARSING JSON RESPONSE...');
        const cleanedInsights = cleanJsonResponse(rawInsights);
        const sanitizedInsights = sanitizeJsonString(cleanedInsights);

        let parsedInsights;
        try {
          parsedInsights = JSON.parse(sanitizedInsights);
          console.log('🔍 JSON PARSED SUCCESSFULLY');
          
          console.log(`🔍 STARTING VALIDATION ATTEMPT ${attempt}/${MAX_RETRIES}`);
          validateInsightsStructure(parsedInsights);
          console.log(`✅ VALIDATION PASSED ON ATTEMPT ${attempt}/${MAX_RETRIES}`);

          if (parsedInsights.summary) {
            const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
            parsedInsights.summary = formattedSummary;
            console.log('🔍 SUMMARY FORMATTING APPLIED');
          }
          
          finalInsights = JSON.stringify(parsedInsights);
          console.log(`✅ INSIGHTS GENERATION SUCCESSFUL ON ATTEMPT ${attempt}/${MAX_RETRIES} ${forceRegenerate ? '(FORCED)' : ''}`);
          
        } catch (jsonError) {
          console.error(`❌ JSON PARSING FAILED ON ATTEMPT ${attempt}/${MAX_RETRIES}:`, jsonError.message);
          if (attempt === MAX_RETRIES) {
            throw new Error(`OpenAI returned invalid JSON format after ${MAX_RETRIES} attempts: ${jsonError.message}`);
          }
        }
        
      } catch (validationError) {
        console.error(`❌ VALIDATION FAILED ON ATTEMPT ${attempt}/${MAX_RETRIES}:`, validationError.message);
        
        if (attempt === MAX_RETRIES) {
          console.error(`❌ CRITICAL: All ${MAX_RETRIES} attempts failed validation. Final error: ${validationError.message}`);
          throw new Error(`Generated insights failed validation after ${MAX_RETRIES} attempts. Last error: ${validationError.message}`);
        }
        
        console.log(`🔄 RETRYING GENERATION - Attempt ${attempt + 1}/${MAX_RETRIES}`);
        attempt++;
        
        // Brief delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!finalInsights) {
      throw new Error('Failed to generate valid insights after all retry attempts');
    }

    console.log('🔍 FINAL INSIGHTS PREPARED - Length:', finalInsights.length);

    // Save insights only if we have a valid assessment ID
    if (assessmentId) {
      console.log(`🔍 SAVING ${forceRegenerate ? 'REGENERATED' : 'NEW'} INSIGHTS TO DATABASE:`, assessmentId);
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
      console.log(`🔍 ${forceRegenerate ? 'REGENERATED' : 'NEW'} INSIGHTS SAVED SUCCESSFULLY`);
    } else {
      console.log('🔍 TEST MODE: Insights generated but not saved (no assessmentId)');
    }

    console.log('🔍 === GENERATE INSIGHTS FUNCTION SUCCESS ===');

    return new Response(JSON.stringify({ insights: finalInsights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🔍 === GENERATE INSIGHTS FUNCTION ERROR ===');
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    const errorMessage = error.message.includes('OpenAI') 
      ? 'Unable to generate insights due to AI service error. Please try again later.'
      : error.message.includes('already exist')
      ? 'Insights already exist for this assessment and cannot be regenerated.'
      : error.message.includes('validation')
      ? `Insights generation failed validation requirements: ${error.message}`
      : 'An unexpected error occurred while generating insights. Please try again.';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

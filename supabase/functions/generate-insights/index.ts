
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateEnvironmentVariables, validateInsightsStructure } from './utils/validation.ts';
import { cleanJsonResponse, formatSummaryIntoParagraphs, sanitizeJsonString } from './utils/formatting.ts';
import { buildAssessmentData, buildPrompt } from './utils/promptBuilder.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { checkExistingInsights, saveInsights } from './utils/database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== GENERATE INSIGHTS FUNCTION START ===');
    
    // Validate environment variables
    const { openAIApiKey, supabaseUrl, supabaseServiceKey } = validateEnvironmentVariables();
    console.log('Environment variables validated successfully');

    const requestBody = await req.json();
    console.log('Request body received:', {
      categoriesCount: requestBody.categories?.length || 0,
      hasDemo: !!requestBody.demographics,
      averageGap: requestBody.averageGap,
      assessmentId: requestBody.assessmentId
    });

    const { categories, demographics, averageGap, assessmentId } = requestBody;

    // CRITICAL FIRST CHECK: Always verify existing insights before ANY processing
    if (assessmentId && assessmentId.trim() !== '') {
      console.log('CRITICAL SAFEGUARD: Checking for existing insights before any processing');
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
      if (existingInsights) {
        console.log('CRITICAL SAFEGUARD: Existing insights found - returning immediately without any generation');
        return new Response(JSON.stringify({ insights: existingInsights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.log('CRITICAL SAFEGUARD: No assessment ID provided - proceeding with generation for temporary use');
    }

    console.log('CRITICAL SAFEGUARD: No existing insights confirmed - generating new insights (ONLY ONCE)');

    // Build assessment data and prompt
    console.log('Building assessment data and prompt...');
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    const prompt = buildPrompt(assessmentSummary);
    console.log('Prompt built successfully, length:', prompt.length);

    // Call OpenAI
    console.log('Calling OpenAI API...');
    const rawInsights = await callOpenAI(prompt, openAIApiKey);
    console.log('OpenAI API call successful, response length:', rawInsights.length);

    // Clean and parse the response
    console.log('Cleaning JSON response...');
    const cleanedInsights = cleanJsonResponse(rawInsights);
    console.log('JSON cleaned, attempting sanitization...');
    
    const sanitizedInsights = sanitizeJsonString(cleanedInsights);
    console.log('JSON sanitized successfully');

    let parsedInsights;
    try {
      console.log('Parsing sanitized JSON...');
      parsedInsights = JSON.parse(sanitizedInsights);
      console.log('JSON parsed successfully');
      
      console.log('Validating insights structure...');
      validateInsightsStructure(parsedInsights);
      console.log('Insights structure validation passed');

      // POST-PROCESS THE SUMMARY: Apply enhanced paragraph formatting
      if (parsedInsights.summary) {
        console.log('Applying summary formatting...');
        const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
        parsedInsights.summary = formattedSummary;
        console.log('Summary formatting applied successfully');
      }
      
    } catch (jsonError) {
      console.error('JSON parsing or validation failed:', jsonError.message);
      console.error('Sanitized response sample:', sanitizedInsights.substring(0, 500) + '...');
      throw new Error(`OpenAI returned invalid JSON format: ${jsonError.message}`);
    }

    // Convert back to JSON string with enhanced formatted summary
    const finalInsights = JSON.stringify(parsedInsights);
    console.log('Final insights prepared, length:', finalInsights.length);

    // CRITICAL FINAL SAFEGUARD: Only save if we have a valid assessment ID and confirm no existing insights
    if (assessmentId && assessmentId.trim() !== '') {
      console.log('CRITICAL FINAL SAFEGUARD: Attempting to save insights with final protection check');
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
      console.log('Insights saved successfully');
    } else {
      console.log('CRITICAL FINAL SAFEGUARD: No assessment ID - returning insights without saving');
    }

    console.log('=== GENERATE INSIGHTS FUNCTION SUCCESS ===');

    return new Response(JSON.stringify({ insights: finalInsights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== GENERATE INSIGHTS FUNCTION ERROR ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    const errorMessage = error.message.includes('OpenAI') 
      ? 'Unable to generate insights due to AI service error. Please try again later.'
      : error.message.includes('already exist')
      ? 'Insights already exist for this assessment and cannot be regenerated.'
      : 'An unexpected error occurred while generating insights. Please try again.';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

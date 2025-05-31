
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateEnvironmentVariables, validateInsightsStructure } from './utils/validation.ts';
import { cleanJsonResponse, formatSummaryIntoParagraphs } from './utils/formatting.ts';
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
    // Validate environment variables
    const { openAIApiKey, supabaseUrl, supabaseServiceKey } = validateEnvironmentVariables();

    const { categories, demographics, averageGap, assessmentId } = await req.json();

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
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    const prompt = buildPrompt(assessmentSummary);

    // Call OpenAI
    const rawInsights = await callOpenAI(prompt, openAIApiKey);

    // Clean and parse the response
    const cleanedInsights = cleanJsonResponse(rawInsights);
    console.log('Cleaned insights JSON:', cleanedInsights);

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(cleanedInsights);
      validateInsightsStructure(parsedInsights);

      // POST-PROCESS THE SUMMARY: Apply enhanced paragraph formatting
      if (parsedInsights.summary) {
        console.log('Original summary:', parsedInsights.summary);
        
        const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
        parsedInsights.summary = formattedSummary;
        
        console.log('Enhanced formatted summary:', formattedSummary);
      }
      
      console.log('Successfully validated JSON structure and applied enhanced summary formatting');
    } catch (jsonError) {
      console.error('Invalid JSON response from OpenAI after cleaning:', jsonError);
      console.error('Cleaned response was:', cleanedInsights);
      throw new Error(`OpenAI returned invalid JSON format: ${jsonError.message}`);
    }

    // Convert back to JSON string with enhanced formatted summary
    const finalInsights = JSON.stringify(parsedInsights);

    // CRITICAL FINAL SAFEGUARD: Only save if we have a valid assessment ID and confirm no existing insights
    if (assessmentId && assessmentId.trim() !== '') {
      console.log('CRITICAL FINAL SAFEGUARD: Attempting to save insights with final protection check');
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
    } else {
      console.log('CRITICAL FINAL SAFEGUARD: No assessment ID - returning insights without saving');
    }

    console.log('Successfully generated and processed insights with all critical safeguards in place');

    return new Response(JSON.stringify({ insights: finalInsights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    
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

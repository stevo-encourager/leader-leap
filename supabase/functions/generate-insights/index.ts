
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
      forceRegenerate: requestBody.forceRegenerate
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
      forceRegenerate: forceRegenerate
    });

    // Check for existing insights only if we have an assessmentId
    if (assessmentId) {
      console.log('🔍 CHECKING FOR EXISTING INSIGHTS:', {
        assessmentId,
        forceRegenerate
      });
      
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey, forceRegenerate);
      
      console.log('🔍 DATABASE CHECK RESULT:', {
        hasExistingInsights: !!existingInsights,
        existingInsightsLength: existingInsights?.length || 0,
        willReturnExisting: !!existingInsights
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

    // Build assessment data and prompt
    console.log('🔍 BUILDING ASSESSMENT DATA AND PROMPT...');
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    
    console.log('🔍 ASSESSMENT SUMMARY BUILT:', {
      demographicsKeys: Object.keys(assessmentSummary.demographics),
      averageGap: assessmentSummary.averageGap,
      categoryCount: assessmentSummary.categoryBreakdown.length
    });
    
    const prompt = buildPrompt(assessmentSummary);
    console.log('🔍 PROMPT BUILT - Length:', prompt.length);

    // Retry logic for validation failures
    const MAX_RETRIES = 3;
    let attempt = 1;
    let finalInsights: string | null = null;

    while (attempt <= MAX_RETRIES && !finalInsights) {
      console.log(`🔍 GENERATION ATTEMPT ${attempt}/${MAX_RETRIES}`);
      
      try {
        // Call OpenAI
        console.log('🔍 CALLING OPENAI API...');
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
          console.log(`✅ INSIGHTS GENERATION SUCCESSFUL ON ATTEMPT ${attempt}/${MAX_RETRIES}`);
          
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
      console.log('🔍 SAVING INSIGHTS TO DATABASE:', assessmentId);
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
      console.log('🔍 INSIGHTS SAVED SUCCESSFULLY');
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

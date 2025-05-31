
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
    console.log('=== Starting generate-insights function ===');
    
    // Validate environment variables
    const { openAIApiKey, supabaseUrl, supabaseServiceKey } = validateEnvironmentVariables();
    console.log('Environment variables validated successfully');

    const requestBody = await req.json();
    console.log('Request body structure:', {
      hasCategories: !!requestBody.categories,
      categoriesCount: requestBody.categories?.length || 0,
      hasDemographics: !!requestBody.demographics,
      hasAverageGap: typeof requestBody.averageGap === 'number',
      hasAssessmentId: !!requestBody.assessmentId
    });

    const { categories, demographics, averageGap, assessmentId } = requestBody;

    // CRITICAL: Always check if insights already exist first - NEVER regenerate
    if (assessmentId) {
      console.log(`Checking for existing insights for assessment: ${assessmentId}`);
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
      if (existingInsights) {
        console.log('Found existing insights, returning saved version');
        return new Response(JSON.stringify({ insights: existingInsights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('No existing insights found - generating new insights');

    // Build assessment data and prompt
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    console.log('Assessment summary built:', {
      totalCategories: assessmentSummary.totalCategories,
      averageGap: assessmentSummary.averageGap,
      categoryBreakdownCount: assessmentSummary.categoryBreakdown?.length || 0
    });

    const prompt = buildPrompt(assessmentSummary);
    console.log('Prompt generated, length:', prompt.length);

    // Call OpenAI
    console.log('Calling OpenAI API...');
    const rawInsights = await callOpenAI(prompt, openAIApiKey);

    // Clean and parse the response
    console.log('Cleaning JSON response...');
    const cleanedInsights = cleanJsonResponse(rawInsights);
    console.log('Cleaned insights length:', cleanedInsights.length);

    let parsedInsights;
    try {
      console.log('Parsing JSON response...');
      parsedInsights = JSON.parse(cleanedInsights);
      
      console.log('Validating insights structure...');
      validateInsightsStructure(parsedInsights);

      // POST-PROCESS THE SUMMARY: Apply enhanced paragraph formatting
      if (parsedInsights.summary) {
        console.log('Formatting summary into paragraphs...');
        const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
        parsedInsights.summary = formattedSummary;
        console.log('Summary formatting completed');
      }
      
      console.log('JSON validation and formatting completed successfully');
    } catch (jsonError) {
      console.error('JSON parsing/validation error:', jsonError);
      console.error('Cleaned response preview:', cleanedInsights.substring(0, 500));
      
      // Provide more specific error information
      if (jsonError.message.includes('Unexpected token')) {
        throw new Error(`Invalid JSON format from OpenAI: ${jsonError.message}. Response may contain markdown or extra text.`);
      } else if (jsonError.message.includes('Invalid priority area structure')) {
        throw new Error(`OpenAI response structure validation failed: ${jsonError.message}`);
      } else {
        throw new Error(`Failed to process OpenAI response: ${jsonError.message}`);
      }
    }

    // Convert back to JSON string with enhanced formatted summary
    const finalInsights = JSON.stringify(parsedInsights);
    console.log('Final insights prepared, length:', finalInsights.length);

    // ALWAYS save insights to database if assessmentId is provided
    if (assessmentId) {
      console.log(`Saving insights to database for assessment: ${assessmentId}`);
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
      console.log('Insights saved successfully');
    }

    console.log('=== Generate-insights function completed successfully ===');

    return new Response(JSON.stringify({ insights: finalInsights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== ERROR in generate-insights function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'An unexpected error occurred while generating insights. Please try again.';
    let statusCode = 500;
    
    if (error.message.includes('OpenAI API key not configured')) {
      errorMessage = 'OpenAI API key is not properly configured. Please check your environment variables.';
      statusCode = 500;
    } else if (error.message.includes('OpenAI API error')) {
      errorMessage = `AI service error: ${error.message}. Please try again later.`;
      statusCode = 502;
    } else if (error.message.includes('Network error')) {
      errorMessage = 'Unable to connect to AI service. Please check your connection and try again.';
      statusCode = 503;
    } else if (error.message.includes('Invalid JSON format')) {
      errorMessage = 'AI service returned invalid response format. Please try again.';
      statusCode = 502;
    } else if (error.message.includes('structure validation failed')) {
      errorMessage = 'AI service response validation failed. Please try again.';
      statusCode = 502;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message 
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

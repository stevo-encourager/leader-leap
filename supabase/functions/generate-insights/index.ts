
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateEnvironmentVariables, validateInsightsStructure } from './utils/validation.ts';
import { cleanJsonResponse, formatSummaryIntoParagraphs, sanitizeJsonString } from './utils/formatting.ts';
import { buildAssessmentData, buildPrompt, formatResourceMarkdown } from './utils/promptBuilder.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { checkExistingInsights, saveInsights } from './utils/database.ts';


// Helper to determine CORS origin
function getCorsOrigin(origin: string | null) {
  // Production domain
  const PROD_ORIGIN = 'https://www.leader-leap.com';
  if (origin === PROD_ORIGIN) return PROD_ORIGIN;
  // Allow localhost and dev tools
  if (origin && origin.startsWith('http://localhost')) return '*';
  // Default to production domain for unknown origins
  return PROD_ORIGIN;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': getCorsOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // STEP 1: Validate environment variables
    const { openAIApiKey, supabaseUrl, supabaseServiceKey } = validateEnvironmentVariables();

    // STEP 2: Parse and validate request
    const requestBody = await req.json();
    const { categories, averageGap, assessmentId, forceRegenerate = false, demographics = {} } = requestBody;

    // Basic validation
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      throw new Error('Invalid or missing categories array');
    }

    if (typeof averageGap !== 'number' || averageGap < 0) {
      throw new Error('Invalid averageGap value');
    }

    // Early validation to fail fast
    if (categories.length > 20) {
      throw new Error('Too many categories provided');
    }

    // STEP 3: Check for existing insights (unless force regenerate)
    if (!forceRegenerate) {
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey, forceRegenerate);
      if (existingInsights) {
        return new Response(JSON.stringify({ insights: existingInsights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // STEP 4: Build assessment data and prompt
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    const prompt = buildPrompt(assessmentSummary);

    // STEP 5: Call OpenAI
    const rawInsights = await callOpenAI(prompt, openAIApiKey);

    // STEP 6: Clean and parse the response
    const cleanedInsights = cleanJsonResponse(rawInsights);
    const sanitizedInsights = sanitizeJsonString(cleanedInsights);
    const parsedInsights = JSON.parse(sanitizedInsights);

    // STEP 7: Validate insights structure
    validateInsightsStructure(parsedInsights);

    // STEP 8: Format summary
    if (parsedInsights.summary) {
      const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
      parsedInsights.summary = formattedSummary;
    }

    // STEP 9: Convert resources to markdown format for frontend compatibility
    if (parsedInsights.priority_areas) {
      parsedInsights.priority_areas.forEach((area: any) => {
        if (area.resources && Array.isArray(area.resources)) {
          area.resources = area.resources.map((resource: string) => formatResourceMarkdown(resource));
        }
      });
    }
    if (parsedInsights.key_strengths) {
      parsedInsights.key_strengths.forEach((strength: any) => {
        if (strength.resources && Array.isArray(strength.resources)) {
          strength.resources = strength.resources.map((resource: string) => formatResourceMarkdown(resource));
        }
      });
    }

    // STEP 10: Save insights (if applicable)
    if (assessmentId && assessmentId !== 'new-assessment') {
      try {
        await saveInsights(assessmentId, JSON.stringify(parsedInsights), supabaseUrl, supabaseServiceKey);
      } catch (saveError) {
        // Don't throw error - continue to return insights
      }
    }

    return new Response(JSON.stringify({ insights: JSON.stringify(parsedInsights) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    // Only log error details that are always available
    console.error('🚨 CRITICAL ERROR in generate-insights:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Provide user-friendly error message without exposing internal details
    const userMessage = error.message && error.message.includes('OpenAI') 
      ? 'Unable to generate insights at this time. Please try again later.'
      : 'An unexpected error occurred while generating insights. Please try again.';
    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

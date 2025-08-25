
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateEnvironmentVariables, validateInsightsStructure } from './utils/validation.ts';
import { cleanJsonResponse, formatSummaryIntoParagraphs, sanitizeJsonString } from './utils/formatting.ts';
import { buildAssessmentData, buildPrompt, formatResourceMarkdown } from './utils/promptBuilder.ts';
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
    // STEP 1: Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    // Create client to verify user token
    const supabaseClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // STEP 2: Validate environment variables
    const { openAIApiKey, supabaseServiceKey } = validateEnvironmentVariables();

    // STEP 3: Parse and validate request
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

    // STEP 4: Check for existing insights (unless force regenerate)
    if (!forceRegenerate) {
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey, forceRegenerate);
      if (existingInsights) {
        return new Response(JSON.stringify({ insights: existingInsights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // STEP 5: Build assessment data and prompt
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    const prompt = buildPrompt(assessmentSummary);

    // STEP 6: Call OpenAI
    const rawInsights = await callOpenAI(prompt, openAIApiKey);

    // STEP 7: Clean and parse the response
    const cleanedInsights = cleanJsonResponse(rawInsights);
    const sanitizedInsights = sanitizeJsonString(cleanedInsights);
    const parsedInsights = JSON.parse(sanitizedInsights);

    // STEP 8: Validate insights structure
    validateInsightsStructure(parsedInsights);

    // STEP 9: Format summary
    if (parsedInsights.summary) {
      const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
      parsedInsights.summary = formattedSummary;
    }

    // STEP 10: Convert resources to markdown format for frontend compatibility
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

    // STEP 11: Save insights (if applicable)
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
    
    // Provide user-friendly error message without exposing internal details
    const userMessage = error.message.includes('OpenAI') 
      ? 'Unable to generate insights at this time. Please try again later.'
      : 'An unexpected error occurred while generating insights. Please try again.';
    
    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

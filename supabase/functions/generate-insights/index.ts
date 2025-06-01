
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

    const { categories, demographics, averageGap, assessmentId, forceRegenerate = false } = await req.json();

    console.log('=== PROMPT DEBUG INFO ===');
    console.log('Assessment ID:', assessmentId);
    console.log('Force Regenerate:', forceRegenerate);
    console.log('Demographics:', demographics);
    
    // CRITICAL: Always check if insights already exist first - NEVER regenerate unless forced
    if (assessmentId && !forceRegenerate) {
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
      if (existingInsights) {
        console.log('=== USING EXISTING INSIGHTS ===');
        console.log('Existing insights found - using cached version (generated with previous prompt)');
        return new Response(JSON.stringify({ 
          insights: existingInsights,
          promptUsed: 'CACHED_INSIGHTS_FROM_PREVIOUS_GENERATION',
          regenerated: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (forceRegenerate) {
      console.log('=== FORCED REGENERATION ===');
      console.log('Force regenerate flag is true - will generate new insights with current prompt');
    } else {
      console.log('=== GENERATING NEW INSIGHTS ===');
      console.log('No existing insights found - generating new insights with current prompt');
    }

    // Build assessment data and prompt
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    const prompt = buildPrompt(assessmentSummary);

    // Log prompt information for debugging
    console.log('=== CURRENT PROMPT INFO ===');
    console.log('Prompt length:', prompt.length);
    console.log('Prompt contains "BANNED PHRASES":', prompt.includes('BANNED PHRASES'));
    console.log('Prompt contains "PERSONALIZATION MANDATE":', prompt.includes('PERSONALIZATION MANDATE'));
    console.log('Prompt contains "RESOURCE LINKING REQUIREMENTS":', prompt.includes('RESOURCE LINKING REQUIREMENTS'));
    console.log('Demographics being used:', JSON.stringify(demographics, null, 2));

    // Call OpenAI
    const rawInsights = await callOpenAI(prompt, openAIApiKey);

    // Clean and parse the response
    const cleanedInsights = cleanJsonResponse(rawInsights);
    console.log('Cleaned insights JSON:', cleanedInsights);

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(cleanedInsights);
      validateInsightsStructure(parsedInsights);

      // If recommended_resources exist but priority_areas don't have resources, 
      // we can optionally map some resources to priority areas for backward compatibility
      if (parsedInsights.recommended_resources && Array.isArray(parsedInsights.recommended_resources)) {
        console.log('Found recommended_resources section, ensuring priority areas have resource fields for compatibility');
        
        // Add a generic resource field to priority areas if they don't have one
        parsedInsights.priority_areas.forEach((area: any, index: number) => {
          if (!area.resource && !area.resources) {
            // Try to find a relevant resource from the recommended_resources
            const relevantResource = parsedInsights.recommended_resources.find((res: any) => 
              res.relevance && res.relevance.toLowerCase().includes(area.competency.toLowerCase().split(' ')[0])
            );
            
            if (relevantResource) {
              area.resource = relevantResource.name;
            } else if (parsedInsights.recommended_resources[index]) {
              // Fallback: assign resources in order
              area.resource = parsedInsights.recommended_resources[index].name;
            } else {
              // Final fallback: use a generic placeholder
              area.resource = "Leadership development resource";
            }
          }
        });
      }

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

    // ALWAYS save insights to database if assessmentId is provided
    if (assessmentId) {
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
    }

    console.log('=== GENERATION COMPLETE ===');
    console.log('Successfully generated and saved insights with current prompt');

    return new Response(JSON.stringify({ 
      insights: finalInsights,
      promptUsed: 'CURRENT_PROMPT_VERSION',
      regenerated: forceRegenerate || false,
      debugInfo: {
        promptLength: prompt.length,
        hasNewPromptFeatures: {
          bannedPhrases: prompt.includes('BANNED PHRASES'),
          personalizationMandate: prompt.includes('PERSONALIZATION MANDATE'),
          resourceLinking: prompt.includes('RESOURCE LINKING REQUIREMENTS')
        },
        demographics: demographics
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    
    const errorMessage = error.message.includes('OpenAI') 
      ? 'Unable to generate insights due to AI service error. Please try again later.'
      : 'An unexpected error occurred while generating insights. Please try again.';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

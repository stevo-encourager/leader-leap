
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateEnvironmentVariables, validateInsightsStructure } from './utils/validation.ts';
import { cleanJsonResponse, formatSummaryIntoParagraphs, sanitizeJsonString } from './utils/formatting.ts';
import { buildAssessmentData, buildPrompt } from './utils/promptBuilder.ts';
import { callOpenAI } from './utils/openaiClient.ts';
import { checkExistingInsights, saveInsights } from './utils/database.ts';
import { ALL_RESOURCE_MAPPINGS } from '../../../src/utils/resources/index.ts';

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
      assessmentId: requestBody.assessmentId || 'undefined (new assessment)',
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

    // Special test assessment ID that allows regeneration
    const TEST_ASSESSMENT_ID = '2631edf1-a358-4303-83c1-deb9664b53e2';
    const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

    // ENHANCED: Better validation for assessmentId - allow undefined, null, or placeholder values for new assessments
    const isValidAssessmentId = assessmentId && 
                               typeof assessmentId === 'string' && 
                               assessmentId.trim() !== '' &&
                               assessmentId !== 'undefined' &&
                               assessmentId !== 'null' &&
                               assessmentId !== 'new-assessment';

    console.log('🔍 INPUT VALIDATION PASSED:', {
      categoriesCount: categories.length,
      hasDemo: !!demographics,
      averageGap: averageGap,
      assessmentId: assessmentId || 'new assessment (no ID)',
      isValidAssessmentId: isValidAssessmentId,
      isTestAssessment: isTestAssessment,
      forceRegenerate: forceRegenerate
    });

    // ENHANCED: Only check for existing insights if we have a valid, real assessmentId
    if (isValidAssessmentId) {
      console.log('🔍 CHECKING FOR EXISTING INSIGHTS:', {
        assessmentId,
        isTestAssessment,
        forceRegenerate
      });
      
      // CRITICAL: Pass the forceRegenerate flag to the database check
      const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey, forceRegenerate);
      
      console.log('🔍 DATABASE CHECK RESULT:', {
        hasExistingInsights: !!existingInsights,
        existingInsightsLength: existingInsights?.length || 0,
        willReturnExisting: !!existingInsights,
        isTestAssessment: isTestAssessment,
        forceRegenerate: forceRegenerate
      });
      
      if (existingInsights) {
        console.log('🔍 RETURNING EXISTING INSIGHTS - No generation needed');
        return new Response(JSON.stringify({ insights: existingInsights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (isTestAssessment && forceRegenerate) {
        console.log('🔍 ✨ TEST ASSESSMENT FORCE REGENERATION ACTIVATED - Generating fresh insights');
      } else {
        console.log('🔍 NO EXISTING INSIGHTS FOUND - Proceeding with generation');
      }
    } else {
      console.log('🔍 NEW ASSESSMENT MODE: No valid assessmentId - generating fresh insights without database check');
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

    // Call OpenAI
    console.log('🔍 CALLING OPENAI API...');
    if (isTestAssessment && forceRegenerate) {
      console.log('🔍 ✨ GENERATING FRESH INSIGHTS FOR TEST ASSESSMENT (FORCE REGENERATE)');
    }
    
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
      
      validateInsightsStructure(parsedInsights);
      console.log('🔍 INSIGHTS STRUCTURE VALIDATION PASSED');

      if (parsedInsights.summary) {
        const formattedSummary = formatSummaryIntoParagraphs(parsedInsights.summary);
        parsedInsights.summary = formattedSummary;
        console.log('🔍 SUMMARY FORMATTING APPLIED');
      }
      
    } catch (jsonError) {
      console.error('🔍 JSON PARSING/VALIDATION FAILED:', jsonError.message);
      throw new Error(`OpenAI returned invalid JSON format: ${jsonError.message}`);
    }

    // --- RESOURCE POST-PROCESSING VALIDATION AND AUTO-FILL ---
    function getValidResourceTitlesByType(type) {
      return Object.values(ALL_RESOURCE_MAPPINGS)
        .filter(r => r.type === type)
        .map(r => r.title);
    }
    const allValidTitles = new Set(Object.values(ALL_RESOURCE_MAPPINGS).map(r => r.title));
    const validBooks = getValidResourceTitlesByType('book');
    const validNonBooks = Object.values(ALL_RESOURCE_MAPPINGS)
      .filter(r => r.type !== 'book')
      .map(r => r.title);

    function validateAndFillResources(resources) {
      // Remove invalid
      let filtered = (resources || []).filter(r => allValidTitles.has(r));
      // Ensure max 1 book
      let books = filtered.filter(r => validBooks.includes(r));
      let nonBooks = filtered.filter(r => !validBooks.includes(r));
      if (books.length > 1) books = books.slice(0, 1);
      // Fill if needed
      if (books.length === 0 && validBooks.length > 0) {
        // Add a book not already present
        const bookToAdd = validBooks.find(b => !filtered.includes(b));
        if (bookToAdd) books.push(bookToAdd);
      }
      while (nonBooks.length < 2 && validNonBooks.length > 0) {
        const toAdd = validNonBooks.find(nb => !filtered.includes(nb) && !nonBooks.includes(nb));
        if (toAdd) nonBooks.push(toAdd);
        else break;
      }
      // Final array: 1 book + 2 non-books
      return [...books.slice(0,1), ...nonBooks.slice(0,2)].slice(0,3);
    }

    if (parsedInsights && parsedInsights.priority_areas) {
      parsedInsights.priority_areas = parsedInsights.priority_areas.map(area => {
        console.log('DEBUG: Original priority_area resources for', area.competency, ':', area.resources);
        const validated = validateAndFillResources(area.resources);
        console.log('DEBUG: Filtered/Filled priority_area resources for', area.competency, ':', validated);
        return {
          ...area,
          resources: validated
        };
      });
    }
    if (parsedInsights && parsedInsights.key_strengths) {
      parsedInsights.key_strengths = parsedInsights.key_strengths.map(area => {
        console.log('DEBUG: Original key_strengths resources for', area.competency, ':', area.resources);
        const validated = validateAndFillResources(area.resources);
        console.log('DEBUG: Filtered/Filled key_strengths resources for', area.competency, ':', validated);
        return {
          ...area,
          resources: validated
        };
      });
    }
    // --- END RESOURCE POST-PROCESSING ---

    // Convert back to JSON string with enhanced formatted summary
    const finalInsights = JSON.stringify(parsedInsights);
    console.log('🔍 FINAL INSIGHTS PREPARED - Length:', finalInsights.length);

    // ENHANCED: Only save if we have a valid, real assessmentId
    if (isValidAssessmentId) {
      console.log('🔍 SAVING INSIGHTS TO DATABASE:', assessmentId);
      if (isTestAssessment && forceRegenerate) {
        console.log('🔍 ✨ SAVING REGENERATED INSIGHTS FOR TEST ASSESSMENT');
      }
      await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
      console.log('🔍 INSIGHTS SAVED SUCCESSFULLY');
    } else {
      console.log('🔍 NEW ASSESSMENT MODE: Insights generated but not saved (no valid assessmentId)');
    }

    if (isTestAssessment && forceRegenerate) {
      console.log('🔍 ✨ === FORCE REGENERATION COMPLETED SUCCESSFULLY FOR TEST ASSESSMENT ===');
    } else {
      console.log('🔍 === GENERATE INSIGHTS FUNCTION SUCCESS ===');
    }

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
      : 'An unexpected error occurred while generating insights. Please try again.';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

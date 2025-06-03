
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

    let requestBody: any;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { categories, demographics, averageGap, assessmentId } = requestBody;

    // Validate required inputs using Deno-compatible pattern
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error('Missing or invalid categories in request body');
      return new Response(JSON.stringify({ 
        error: "Missing or invalid 'categories' array in request body. Categories are required for insight generation." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof averageGap !== 'number') {
      console.error('Missing or invalid averageGap in request body');
      return new Response(JSON.stringify({ 
        error: "Missing or invalid 'averageGap' number in request body. Average gap is required for insight generation." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!assessmentId) {
      return new Response(JSON.stringify({ error: "Missing assessmentId in request body" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof assessmentId !== 'string' || assessmentId.trim() === '') {
      console.error('Invalid assessmentId in request body');
      return new Response(JSON.stringify({ 
        error: "Invalid 'assessmentId' in request body. Assessment ID must be a non-empty string." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Input validation passed:', {
      categoriesCount: categories.length,
      hasDemo: !!demographics,
      averageGap: averageGap,
      assessmentId: assessmentId
    });

    // CRITICAL FIRST CHECK: Always verify existing insights before ANY processing
    console.log('CRITICAL SAFEGUARD: Checking for existing insights before any processing');
    const existingInsights = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
    if (existingInsights) {
      console.log('CRITICAL SAFEGUARD: Existing insights found - returning immediately without any generation');
      return new Response(JSON.stringify({ insights: existingInsights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('CRITICAL SAFEGUARD: No existing insights confirmed - generating new insights (ONLY ONCE)');

    // Build assessment data and prompt
    console.log('Building assessment data and prompt...');
    const assessmentSummary = buildAssessmentData(categories, averageGap, demographics);
    
    // Add detailed logging for assessment summary structure
    console.log('ASSESSMENT SUMMARY DEBUG: Structure validation');
    console.log('- Demographics:', JSON.stringify(assessmentSummary.demographics, null, 2));
    console.log('- Average Gap:', assessmentSummary.averageGap);
    console.log('- Category Count:', assessmentSummary.categoryBreakdown.length);
    
    // Log skills that will be referenced in summary (for validation)
    const skillsForSummaryContext = assessmentSummary.categoryBreakdown
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .map(cat => ({
        competency: cat.title,
        topSkills: cat.topGapSkills ? cat.topGapSkills.slice(0, 2).map(skill => skill.title) : []
      }));
    
    console.log('SUMMARY CONTEXT SKILLS DEBUG: Skills available for summary context (names only)');
    skillsForSummaryContext.forEach((cat, i) => {
      console.log(`${i+1}. ${cat.competency}: Skills for context - ${cat.topSkills.join(', ')}`);
    });
    
    const prompt = buildPrompt(assessmentSummary);
    console.log('Prompt built successfully, length:', prompt.length);

    // CRITICAL LOGGING: Log prompt payload structure before sending to OpenAI
    console.log('CRITICAL PROMPT DEBUG: Pre-OpenAI validation');
    console.log('- Prompt includes skill names for summary context validation');
    console.log('- All skill references in summary instructions specify NO NUMBERS requirement');
    console.log('- Demographics properly integrated:', {
      role: assessmentSummary.demographics.role || 'Not specified',
      industry: assessmentSummary.demographics.industry || 'Not specified',
      experience: assessmentSummary.demographics.yearsOfExperience || 'Not specified'
    });

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

      // CRITICAL SUMMARY VALIDATION: Check for numbers in skill names within summary
      if (parsedInsights.summary) {
        console.log('CRITICAL SUMMARY VALIDATION: Checking for numbers in skill names');
        
        // Check for patterns that might indicate numbers in skill names
        const summaryText = parsedInsights.summary;
        const numberPatterns = [
          /\(\s*gap:\s*[\d.]+\s*\)/gi,
          /\(\s*current:\s*[\d.]+\s*\)/gi,
          /\(\s*desired:\s*[\d.]+\s*\)/gi,
          /\(\s*[\d.]+\s*\)/g
        ];
        
        let hasNumberIssues = false;
        numberPatterns.forEach((pattern, index) => {
          const matches = summaryText.match(pattern);
          if (matches && matches.length > 0) {
            console.error(`CRITICAL SUMMARY ERROR: Found number pattern ${index + 1} in summary:`, matches);
            hasNumberIssues = true;
          }
        });
        
        if (!hasNumberIssues) {
          console.log('CRITICAL SUMMARY VALIDATION: Summary passes - no numbers found in skill references');
        }
        
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

    // CRITICAL FINAL VALIDATION LOG: Log final output structure
    console.log('CRITICAL FINAL VALIDATION: Summary structure before API response');
    console.log('- Summary length:', parsedInsights.summary ? parsedInsights.summary.length : 0);
    console.log('- Priority areas count:', parsedInsights.priority_areas ? parsedInsights.priority_areas.length : 0);
    console.log('- Key strengths count:', parsedInsights.key_strengths ? parsedInsights.key_strengths.length : 0);

    // CRITICAL FINAL SAFEGUARD: Only save if we have a valid assessment ID and confirm no existing insights
    console.log('CRITICAL FINAL SAFEGUARD: Attempting to save insights with final protection check');
    await saveInsights(assessmentId, finalInsights, supabaseUrl, supabaseServiceKey);
    console.log('Insights saved successfully');

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

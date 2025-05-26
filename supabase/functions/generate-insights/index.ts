
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helper functions
const isValidCategories = (categories: any): boolean => {
  return Array.isArray(categories) && 
         categories.length > 0 && 
         categories.every(cat => 
           cat && 
           typeof cat.title === 'string' && 
           Array.isArray(cat.skills) &&
           cat.skills.length > 0
         );
};

const isValidDemographics = (demographics: any): boolean => {
  return typeof demographics === 'object' && demographics !== null;
};

const isValidAverageGap = (averageGap: any): boolean => {
  return typeof averageGap === 'number' && 
         !isNaN(averageGap) && 
         isFinite(averageGap) &&
         averageGap >= 0;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration not complete');
      return new Response(JSON.stringify({ error: 'Supabase configuration not complete' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Invalid JSON in request body');
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { categories, demographics, averageGap, assessmentId } = requestBody;
    
    // Input validation
    if (!isValidCategories(categories)) {
      console.error('Invalid or missing categories data');
      return new Response(JSON.stringify({ error: 'Invalid categories data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isValidDemographics(demographics)) {
      console.error('Invalid demographics data');
      return new Response(JSON.stringify({ error: 'Invalid demographics data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isValidAverageGap(averageGap)) {
      console.error('Invalid averageGap value:', averageGap);
      return new Response(JSON.stringify({ error: 'Invalid average gap value provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // CRITICAL: Always check if insights already exist first
    if (assessmentId) {
      console.log('Checking for existing insights for assessment:', assessmentId);
      
      const { data: existingAssessment, error: fetchError } = await supabase
        .from('assessment_results')
        .select('ai_insights')
        .eq('id', assessmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing assessment:', fetchError);
        return new Response(JSON.stringify({ error: 'Could not check for existing insights' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If insights already exist, return them immediately - NEVER regenerate
      if (existingAssessment && existingAssessment.ai_insights && existingAssessment.ai_insights.trim()) {
        console.log('Found existing insights, returning saved version - NEVER regenerating');
        return new Response(JSON.stringify({ insights: existingAssessment.ai_insights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('No existing insights found - generating new insights (ONLY ONCE)');

    // Prepare assessment data summary for OpenAI with safe access
    const assessmentSummary = {
      totalCategories: categories.length,
      averageGap: averageGap,
      demographics: demographics,
      categoryBreakdown: categories.map(cat => {
        const skills = cat.skills || [];
        const validSkills = skills.filter(skill => 
          skill && 
          skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number'
        );
        
        const currentSum = validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0);
        const desiredSum = validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0);
        const skillCount = validSkills.length || 1;
        
        return {
          title: cat.title,
          skillCount: skillCount,
          averageCurrentRating: currentSum / skillCount,
          averageDesiredRating: desiredSum / skillCount,
          gap: (desiredSum / skillCount) - (currentSum / skillCount)
        };
      })
    };

    // Find the top 3 categories with the largest gaps
    const topGapCategories = assessmentSummary.categoryBreakdown
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);

    // VERY SPECIFIC PROMPT to ensure consistent formatting
    const prompt = `As a leadership development expert, analyze this assessment and provide insights in the EXACT format specified below. Do not deviate from this format.

Assessment Data:
- Overall Average Gap: ${averageGap.toFixed(2)}
- Role: ${demographics.role || 'Not specified'}
- Experience: ${demographics.yearsOfExperience || 'Not specified'} years
- Industry: ${demographics.industry || 'Not specified'}

Top 3 Categories by Gap:
${topGapCategories.map((cat, i) => `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)}`).join('\n')}

You MUST respond in this EXACT format with these exact section headers:

## Overall Assessment

[Write 2-3 sentences about the overall leadership profile and main development themes]

## Top 3 Priority Development Areas

${topGapCategories.map((cat, i) => `${i+1}. ${cat.title} (Gap: ${cat.gap.toFixed(1)}): Recommendations: [Provide 2-3 specific, actionable recommendations separated by semicolons]`).join('\n\n')}

## Key Strengths to Leverage

[List 2-3 key strengths as bullet points with - ]

## Actionable Next Step for This Week

[Provide ONE specific action they can take this week]

CRITICAL FORMATTING RULES:
- Use exactly these section headers with ##
- For Priority Development Areas, format exactly as: "Competency Name (Gap: X.X): Recommendations: recommendation 1; recommendation 2; recommendation 3"
- Keep each priority area as one paragraph
- Use bullet points (-) for strengths
- Be specific and actionable in all recommendations`;

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
            content: 'You are a leadership development expert. You MUST follow the exact formatting instructions provided. Do not deviate from the specified format under any circumstances. Always use the exact section headers and formatting specified in the prompt.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent output
        max_tokens: 1200
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse OpenAI response as JSON');
      throw new Error('Invalid response from OpenAI API');
    }

    // Defensive checks for OpenAI response structure
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Invalid OpenAI response structure - no choices array');
      throw new Error('Invalid response structure from OpenAI API');
    }

    const choice = data.choices[0];
    if (!choice || !choice.message || typeof choice.message.content !== 'string') {
      console.error('Invalid OpenAI response structure - no message content');
      throw new Error('Invalid message structure from OpenAI API');
    }

    const insights = choice.message.content.trim();
    
    if (!insights) {
      console.error('Empty insights received from OpenAI');
      throw new Error('Empty response from OpenAI API');
    }

    // ALWAYS save insights to database if assessmentId is provided
    if (assessmentId) {
      console.log('Saving NEW insights to assessment (will NEVER be regenerated):', assessmentId);
      
      const { error: updateError } = await supabase
        .from('assessment_results')
        .update({ ai_insights: insights })
        .eq('id', assessmentId);

      if (updateError) {
        console.error('Error saving insights to database:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to save insights to database' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('Successfully saved insights to database - will be reused forever');
      }
    }

    console.log('Successfully generated and saved insights');

    return new Response(JSON.stringify({ insights }), {
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

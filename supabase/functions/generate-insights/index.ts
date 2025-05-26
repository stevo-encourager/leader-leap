
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

    // If assessmentId is provided, check if insights already exist
    if (assessmentId) {
      console.log('Checking for existing insights for assessment:', assessmentId);
      
      const { data: existingAssessment, error: fetchError } = await supabase
        .from('assessment_results')
        .select('ai_insights')
        .eq('id', assessmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing assessment:', fetchError);
        // Continue with generation if we can't fetch
      } else if (existingAssessment && existingAssessment.ai_insights) {
        console.log('Found existing insights, returning them');
        return new Response(JSON.stringify({ insights: existingAssessment.ai_insights }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Generating new insights for assessment data');

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
        const skillCount = validSkills.length || 1; // Prevent division by zero
        
        return {
          title: cat.title,
          skillCount: skillCount,
          averageCurrentRating: currentSum / skillCount,
          averageDesiredRating: desiredSum / skillCount
        };
      })
    };

    const prompt = `As an expert leadership development coach, analyze this leadership assessment data and provide personalized insights:

Assessment Summary:
- Average Competency Gap: ${averageGap.toFixed(2)}
- Role: ${demographics.role || 'Not specified'}
- Years of Experience: ${demographics.yearsOfExperience || 'Not specified'}
- Industry: ${demographics.industry || 'Not specified'}

Competency Categories Performance:
${assessmentSummary.categoryBreakdown.map(cat => 
  `- ${cat.title}: Current avg ${cat.averageCurrentRating.toFixed(1)}, Desired avg ${cat.averageDesiredRating.toFixed(1)}, Gap: ${(cat.averageDesiredRating - cat.averageCurrentRating).toFixed(1)}`
).join('\n')}

Please provide:
1. A brief overall assessment (2-3 sentences)
2. Top 3 priority development areas with specific recommendations
3. Key strengths to leverage
4. One specific actionable next step for this week

Keep the response professional, encouraging, and actionable. Format with clear sections and bullet points.`;

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
            content: 'You are an expert leadership development coach with 20+ years of experience. Provide personalized, actionable insights based on leadership assessment data. Be encouraging yet direct, focusing on practical development strategies.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
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

    // Save insights to database if assessmentId is provided
    if (assessmentId) {
      console.log('Saving insights to assessment:', assessmentId);
      
      const { error: updateError } = await supabase
        .from('assessment_results')
        .update({ ai_insights: insights })
        .eq('id', assessmentId);

      if (updateError) {
        console.error('Error saving insights to database:', updateError);
        // Continue and return insights even if saving fails
      } else {
        console.log('Successfully saved insights to database');
      }
    }

    console.log('Successfully generated insights');

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    
    // Provide user-friendly error messages
    const errorMessage = error.message.includes('OpenAI') 
      ? 'Unable to generate insights due to AI service error. Please try again later.'
      : 'An unexpected error occurred while generating insights. Please try again.';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

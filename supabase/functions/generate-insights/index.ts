
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

// Helper function to clean and extract JSON from OpenAI response
const cleanJsonResponse = (response: string): string => {
  // Remove any markdown code block formatting
  let cleaned = response.trim();
  
  // Remove ```json at the beginning
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  
  // Remove ``` at the end
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  // Remove any other markdown formatting
  cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
  
  return cleaned.trim();
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

    const { categories, demographics, averageGap, assessmentId } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // CRITICAL: Always check if insights already exist first - NEVER regenerate
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

    // Prepare assessment data summary for OpenAI
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

    // Find the top competencies (categories with smallest gaps and high current ratings)
    const topCompetencies = assessmentSummary.categoryBreakdown
      .filter(cat => cat.averageCurrentRating >= 3.5) // Only consider categories with decent current ratings
      .sort((a, b) => a.gap - b.gap) // Sort by smallest gap (closest to desired)
      .slice(0, 3);

    // Create the assessment data section for the prompt
    const assessmentDataSection = `
Assessment Data:
- Overall Average Gap: ${averageGap.toFixed(2)}
- Role: ${demographics.role || 'Not specified'}
- Experience: ${demographics.yearsOfExperience || 'Not specified'} years
- Industry: ${demographics.industry || 'Not specified'}

Top 3 Categories by Gap (Priority Development Areas):
${topGapCategories.map((cat, i) => `${i+1}. ${cat.title}: Gap ${cat.gap.toFixed(1)} (Current: ${cat.averageCurrentRating.toFixed(1)}, Desired: ${cat.averageDesiredRating.toFixed(1)})`).join('\n')}

Top Competency Areas (High Current Ratings, Low Gaps):
${topCompetencies.map((cat, i) => `${i+1}. ${cat.title}: Current ${cat.averageCurrentRating.toFixed(1)}, Gap ${cat.gap.toFixed(1)}`).join('\n')}
`;

    // Enhanced prompt with well-known leader examples and competencies terminology
    const prompt = `${assessmentDataSection}

You are an expert leadership coach and assessment analyst. Based on the provided assessment data (including competency names, gap scores, and top competencies), generate AI insights for a user's leadership assessment.

### CRITICAL: JSON Structure Requirements

You MUST output ONLY a valid JSON object with this EXACT structure:

{
  "summary": "string",
  "priority_areas": [
    {
      "competency": "string",
      "gap": number,
      "insights": ["string1", "string2", "string3"],
      "resource": "string"
    }
  ],
  "key_strengths": [
    {
      "competency": "string", 
      "example": "string",
      "leverage_advice": ["string1", "string2", "string3"]
    }
  ]
}

### Field Requirements

- \`summary\`: Generate a professional, concise, and impactful assessment summary that is 6–8 sentences total, structured as two or three short paragraphs for better readability. Use the word "competencies" throughout (not "strengths"). Always refer to the person as "you" or "your" (never "the user" or "the user's"). In the first paragraph, directly identify your most distinctive competencies and what those mean for your leadership style or capabilities. In the second (or third) paragraph, note your key areas for development (gaps or opportunities), clearly explaining why these matter for effective leadership. Include a brief example of a well-known leader (real or historical) who exemplifies your top competencies. Name the leader, state what competencies they are known for, and connect this to your assessment. Highlight the practical impact or opportunities unlocked by focusing on these development areas. Where relevant, connect how your top competencies can support your growth in development areas. Avoid generic praise or congratulatory language. Keep the tone confident, clear, and professional—make every sentence specific and purposeful. Output as two or three well-written paragraphs separated by double line breaks (\\n\\n). Use only the data provided; do not invent details about you or your organization.

- \`priority_areas\`: An array with exactly 3 objects, each for a Top 3 Priority Development Area:
  - \`competency\` (string): The name of the competency from the assessment data above
  - \`gap\` (number): The gap score from the assessment data above
  - \`insights\` (array of exactly 3 strings): Each is an instructive, reflective, or "aha" insight about the user's leadership in this area. Each insight must be practical, specific, and non-repetitive. One of these must reference the recommended resource.
  - \`resource\` (string): A directly relevant, practical resource (article, course, framework, etc.), referenced in one of the insights.

- \`key_strengths\`: An array with at least 2 objects, each for a key competency to leverage:
  - \`competency\` (string): The name of the competency from the assessment data above
  - \`example\` (string): A concrete example of this competency in action (from data or a plausible scenario)
  - \`leverage_advice\` (array of exactly 3 strings): Three actionable, positive suggestions for further leveraging this competency. No resource here.

### CRITICAL JSON Rules
- Output MUST be valid JSON only. No text, markdown, or formatting before/after.
- The \`insights\` field must be an array of strings ONLY. Do NOT include any other keys inside this array.
- The \`resource\` field must be at the same level as \`insights\`, NOT inside the insights array.
- All arrays must contain only the specified data types.

Base your insights on the assessment data provided above.`;

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
            content: 'You are an expert leadership coach and assessment analyst. You MUST respond with valid JSON only, no additional text or formatting. Follow the exact JSON structure specified in the user prompt. The insights array must contain ONLY strings, never objects or other keys. Use the word "competencies" throughout your response instead of "strengths". Always refer to the person as "you" or "your" (never "the user" or "the user\'s"). For the summary field, structure your response as multiple paragraphs separated by double line breaks (\\n\\n) for better readability.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // Very low temperature for maximum consistency
        max_tokens: 2500 // Increased for the enhanced summary format
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const rawInsights = data.choices[0].message.content.trim();
    
    if (!rawInsights) {
      throw new Error('Empty response from OpenAI API');
    }

    console.log('Raw OpenAI response:', rawInsights);

    // Clean the response to remove any markdown formatting
    const cleanedInsights = cleanJsonResponse(rawInsights);
    console.log('Cleaned insights JSON:', cleanedInsights);

    // Validate that the cleaned response is valid JSON with the correct structure
    try {
      const parsedInsights = JSON.parse(cleanedInsights);
      
      // Basic validation of the structure
      if (!parsedInsights.summary || !parsedInsights.priority_areas || !parsedInsights.key_strengths) {
        throw new Error('Invalid JSON structure - missing required fields: summary, priority_areas, or key_strengths');
      }
      
      if (!Array.isArray(parsedInsights.priority_areas) || !Array.isArray(parsedInsights.key_strengths)) {
        throw new Error('Invalid JSON structure - priority_areas and key_strengths must be arrays');
      }

      if (parsedInsights.priority_areas.length !== 3) {
        throw new Error('Invalid JSON structure - priority_areas must have exactly 3 items');
      }

      if (parsedInsights.key_strengths.length < 2) {
        throw new Error('Invalid JSON structure - key_strengths must have at least 2 items');
      }

      // Validate the priority areas structure more thoroughly
      for (const area of parsedInsights.priority_areas) {
        if (!area.competency || !area.insights || !Array.isArray(area.insights) || area.insights.length !== 3 || !area.resource) {
          throw new Error('Invalid priority area structure - must have competency, gap, insights array with 3 strings, and resource');
        }
        
        // Check that insights array contains only strings
        for (const insight of area.insights) {
          if (typeof insight !== 'string') {
            throw new Error('Invalid priority area structure - insights array must contain only strings');
          }
        }
        
        if (typeof area.gap !== 'number') {
          throw new Error('Invalid priority area structure - gap must be a number');
        }
      }

      // Validate key strengths structure
      for (const strength of parsedInsights.key_strengths) {
        if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice) || strength.leverage_advice.length !== 3) {
          throw new Error('Invalid key strength structure - must have competency, example, and leverage_advice array with 3 strings');
        }
        
        // Check that leverage_advice array contains only strings
        for (const advice of strength.leverage_advice) {
          if (typeof advice !== 'string') {
            throw new Error('Invalid key strength structure - leverage_advice array must contain only strings');
          }
        }
      }
      
      console.log('Successfully validated JSON structure with multi-paragraph competencies format');
    } catch (jsonError) {
      console.error('Invalid JSON response from OpenAI after cleaning:', jsonError);
      console.error('Cleaned response was:', cleanedInsights);
      throw new Error(`OpenAI returned invalid JSON format: ${jsonError.message}`);
    }

    // ALWAYS save insights to database if assessmentId is provided
    if (assessmentId) {
      console.log('Saving NEW insights to assessment (will NEVER be regenerated):', assessmentId);
      
      const { error: updateError } = await supabase
        .from('assessment_results')
        .update({ ai_insights: cleanedInsights })
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

    console.log('Successfully generated and saved insights with multi-paragraph competencies format');

    return new Response(JSON.stringify({ insights: cleanedInsights }), {
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


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { categories, demographics, averageGap } = await req.json();
    
    console.log('Generating insights for assessment data');

    // Prepare assessment data summary for OpenAI
    const assessmentSummary = {
      totalCategories: categories.length,
      averageGap: averageGap,
      demographics: demographics,
      categoryBreakdown: categories.map(cat => ({
        title: cat.title,
        skillCount: cat.skills?.length || 0,
        averageCurrentRating: cat.skills?.reduce((sum, skill) => sum + (skill.ratings?.current || 0), 0) / (cat.skills?.length || 1),
        averageDesiredRating: cat.skills?.reduce((sum, skill) => sum + (skill.ratings?.desired || 0), 0) / (cat.skills?.length || 1)
      }))
    };

    const prompt = `As an expert leadership development coach, analyze this leadership assessment data and provide personalized insights:

Assessment Summary:
- Average Competency Gap: ${averageGap}
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    console.log('Successfully generated insights');

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

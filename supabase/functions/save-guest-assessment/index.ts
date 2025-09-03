import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // This function is designed for guest users - no authentication required
    console.log('save-guest-assessment called for guest user');
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { categories, demographics } = await req.json();

    // Validate input
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid categories data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate synthetic tempUserId (format: temp_<timestamp>_<random>)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const tempUserId = `temp_${timestamp}_${randomSuffix}`;

    // Validate that all skills have ratings
    let totalSkills = 0;
    let skillsWithBothRatings = 0;
    
    categories.forEach((category: any) => {
      if (category && category.skills && Array.isArray(category.skills)) {
        category.skills.forEach((skill: any) => {
          totalSkills++;
          
          if (skill && skill.ratings) {
            const currentRating = Number(skill.ratings.current) || 0;
            const desiredRating = Number(skill.ratings.desired) || 0;
            
            if (currentRating > 0 && desiredRating > 0) {
              skillsWithBothRatings++;
            }
          }
        });
      }
    });

    const isComplete = totalSkills > 0 && skillsWithBothRatings === totalSkills;

    // Save assessment to database using service role
    const { data, error } = await supabaseAdmin
      .from('assessment_results')
      .insert({
        user_id: tempUserId,
        categories: categories,
        demographics: demographics || {},
        completed: isComplete,
        ai_insights: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving guest assessment:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save assessment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the saved assessment data
    return new Response(
      JSON.stringify({ 
        success: true, 
        assessmentId: data.id,
        tempUserId: tempUserId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
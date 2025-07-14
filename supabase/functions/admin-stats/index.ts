
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

  // --- JWT & Admin Check ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }
  const jwt = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } });

  // Get user info from JWT
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  // Check is_admin in profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (profileError || !profile?.is_admin) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  // --- Admin logic (unchanged) ---
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Get user count via admin function
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (userError) {
      console.error("Error listing users:", userError);
      return new Response(
        JSON.stringify({ success: false, error: userError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    const userCount = userData?.users?.length || 0;
    // Get profile count using service role (bypasses RLS)
    const { count: profileCount, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (profileError) {
      console.error("Error getting profile count:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: profileError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    // Get assessment count using service role (bypasses RLS)
    const { count: assessmentCount, error: assessmentError } = await supabaseAdmin
      .from('assessment_results')
      .select('*', { count: 'exact', head: true });
    if (assessmentError) {
      console.error("Error getting assessment count:", assessmentError);
      return new Response(
        JSON.stringify({ success: false, error: assessmentError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    return new Response(
      JSON.stringify({ 
        success: true,
        userCount,
        profileCount: profileCount || 0,
        assessmentCount: assessmentCount || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in admin-stats function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

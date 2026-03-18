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
    const { email } = await req.json();
    
    console.log('[Resend] Received unsubscribe request for:', email);
    
    if (!email) {
      console.log('[Resend] No email provided in request body.');
      return new Response(
        JSON.stringify({ error: 'Email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    console.log('[Resend] API key configured:', resendApiKey ? 'Yes' : 'No');
    
    if (!resendApiKey) {
      console.error('[Resend] Missing configuration: API key');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client to track subscriptions
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Update subscription status in database
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ 
        newsletter_subscribed: false,
        newsletter_unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);

    if (dbError) {
      console.log('[Resend] Database update error:', dbError);
      // Continue anyway - the unsubscription tracking is not critical
    }

    console.log('[Resend] Successfully unsubscribed:', email);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Successfully unsubscribed from newsletter' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    console.error('[Resend] Error unsubscribing:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
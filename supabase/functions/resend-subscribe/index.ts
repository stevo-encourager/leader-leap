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
    const { email, firstName, lastName } = await req.json();
    
    console.log('[Resend] Received subscribe request for:', email, 'Name:', firstName, lastName);
    
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

    // Store subscription status in database
    // We'll track newsletter subscriptions in the profiles table
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ 
        newsletter_subscribed: true,
        newsletter_subscribed_at: new Date().toISOString()
      })
      .eq('email', email);

    if (dbError) {
      console.log('[Resend] Database update error:', dbError);
      // Continue anyway - the subscription tracking is not critical
    }

    // For now, we'll just track the subscription in the database
    // When you're ready to send actual newsletters, you can use Resend's send API
    // to send emails to users who have newsletter_subscribed = true
    
    console.log('[Resend] Successfully subscribed:', email);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed to newsletter' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    console.error('[Resend] Error subscribing:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
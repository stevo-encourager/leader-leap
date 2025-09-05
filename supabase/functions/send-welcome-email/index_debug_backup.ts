import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('=== DEBUG: Function started ===');
    
    // Test basic functionality
    const body = await req.json();
    console.log('=== DEBUG: Received body ===', body);
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    console.log('=== DEBUG: Environment check ===', {
      hasSupabaseUrl: !!supabaseUrl,
      supabaseUrlLength: supabaseUrl?.length || 0,
      hasServiceKey: !!serviceKey,
      serviceKeyLength: serviceKey?.length || 0,
      hasResendKey: !!resendKey,
      resendKeyLength: resendKey?.length || 0
    });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Debug function working',
        receivedData: body,
        environment: {
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceKey: !!serviceKey,
          hasResendKey: !!resendKey
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('=== DEBUG: Error in function ===', error);
    return new Response(
      JSON.stringify({ 
        error: 'Debug function failed',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
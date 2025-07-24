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
    const { email, firstName, lastName } = await req.json();
    
    console.log('[Brevo] Received subscribe request for:', email, 'Name:', firstName, lastName);
    
    if (!email) {
      console.log('[Brevo] No email provided in request body.');
      return new Response(
        JSON.stringify({ error: 'Email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare contact data
    const contactData: any = { 
      email, 
      listIds: [24] 
    };

    // Add name fields if provided
    if (firstName) {
      contactData.attributes = { ...contactData.attributes, FIRSTNAME: firstName };
    }
    if (lastName) {
      contactData.attributes = { ...contactData.attributes, LASTNAME: lastName };
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('BREVO_API_KEY') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const responseBody = await response.text();
    console.log('[Brevo] API response status:', response.status);
    console.log('[Brevo] API response body:', responseBody);

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (response.status === 400 && responseBody.includes('duplicate_parameter')) {
      // Email already exists in Brevo - treat as success
      console.log('[Brevo] Email already exists, treating as success');
      return new Response(
        JSON.stringify({ success: true, message: 'Email already subscribed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: responseBody }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('[Brevo] Error subscribing:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 
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
    const { email } = await req.json();
    
    console.log('[Brevo] Received unsubscribe request for:', email);
    
    if (!email) {
      console.log('[Brevo] No email provided in request body.');
      return new Response(
        JSON.stringify({ error: 'Email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, get the contact ID from Brevo
    const searchResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'api-key': Deno.env.get('BREVO_API_KEY') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      console.log('[Brevo] Contact not found or error searching:', searchResponse.status);
      // If contact doesn't exist, consider it a successful unsubscribe
      return new Response(
        JSON.stringify({ success: true, message: 'Contact not found or already unsubscribed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contactData = await searchResponse.json();
    const contactId = contactData.id;

    if (!contactId) {
      console.log('[Brevo] No contact ID found in response');
      return new Response(
        JSON.stringify({ error: 'Contact ID not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the contact to remove from lists and mark as unsubscribed
    const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'api-key': Deno.env.get('BREVO_API_KEY') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        emailBlacklisted: true,
        smsBlacklisted: true,
        listIds: [], // Remove from all lists
        unlinkListIds: [2, 15], // Explicitly remove from your lists
      }),
    });

    const updateResponseBody = await updateResponse.text();
    console.log('[Brevo] Update response status:', updateResponse.status);
    console.log('[Brevo] Update response body:', updateResponseBody);

    if (updateResponse.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'Successfully unsubscribed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: updateResponseBody }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('[Brevo] Error unsubscribing:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 
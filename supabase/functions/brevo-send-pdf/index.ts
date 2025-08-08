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
    const { email, pdfBase64, assessmentId } = await req.json();
    
    console.log('[Brevo] Received PDF email request for:', email);
    
    if (!email || !pdfBase64) {
      console.log('[Brevo] Missing email or PDF data in request body.');
      return new Response(
        JSON.stringify({ error: 'Email and PDF data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configure the Brevo API request
    const emailData = {
      to: [{ email: email, name: email.split('@')[0] }],
      sender: { name: 'Encourager Coaching', email: 'info@encouragercoaching.com' },
      subject: 'Your Leader Leap Assessment Results',
      htmlContent: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2F564D; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #2F564D; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your Leader Leap Assessment Results</h1>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>Thank you for completing your Leader Leap Assessment! Your personalised leadership development report is attached to this email.</p>
                <p>This comprehensive report includes:</p>
                <ul>
                  <li>Your competency analysis across 11 leadership areas</li>
                  <li>Personalised insights and recommendations</li>
                  <li>Development priorities and action steps</li>
                  <li>Professional development resources</li>
                </ul>
                <p>We recommend reviewing this report with your manager or mentor to create a targeted development plan.</p>
                <p>If you have any questions about your results or would like to discuss professional development coaching, please don't hesitate to reach out.</p>
                <p>Best regards,<br>The Encourager Coaching Team</p>
              </div>
              <div class="footer">
                <p>Encourager Coaching<br>www.encouragercoaching.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachment: [{
        name: 'leader-leap-assessment-results.pdf',
        content: pdfBase64
      }]
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('BREVO_API_KEY') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseBody = await response.text();
    console.log('[Brevo] PDF email API response status:', response.status);
    console.log('[Brevo] PDF email API response body:', responseBody);

    if (response.ok) {
      const result = JSON.parse(responseBody);
      return new Response(
        JSON.stringify({ success: true, messageId: result.messageId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: responseBody }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('[Brevo] Error sending PDF email:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 
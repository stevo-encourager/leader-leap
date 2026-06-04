import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  userId: string;
  userEmail: string;
  userName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow anonymous access for testing
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      message: 'Welcome email function is running',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { userId, userEmail, userName }: EmailRequest = await req.json();
    
    if (!userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId or userEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client 
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user profile info including welcome email status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, welcome_email_sent_at, welcome_email_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Failed to fetch user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if welcome email already sent using database
    if (profile?.welcome_email_sent_at) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Welcome email already sent',
          sentAt: profile.welcome_email_sent_at,
          emailId: profile.welcome_email_id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atomically mark as sending to prevent race conditions
    const { data: updateResult, error: lockError } = await supabase
      .from('profiles')
      .update({ 
        welcome_email_sent_at: new Date().toISOString()
      })
      .eq('id', userId)
      .is('welcome_email_sent_at', null)
      .select();

    // If no rows were updated, another request already processed this user
    if (!updateResult || updateResult.length === 0) {
      console.log('Welcome email already being sent or was sent - no rows updated');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Welcome email already sent or in progress'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (lockError) {
      console.log('Welcome email database error:', lockError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Database error checking welcome email status'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const displayName = profile?.first_name || 'there';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leader Leap <steve.thompson@leader-leap.com>',
        to: [userEmail],
        subject: 'Welcome to Leader Leap - Discover Your Leadership Gaps!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Leader Leap</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              
              <p>Hi ${displayName},</p>
              
              <p>Welcome to Leader Leap! Your account is now active and you're ready to discover your leadership gaps...and do something about them!</p>
              
              <p><strong>In the age of AI, the uniquely human skills of leadership become our greatest differentiators.</strong> This platform helps you identify exactly where to focus your development to future-proof your career.</p>
              
              <h3 style="color: #000000; margin-top: 30px; margin-bottom: 15px;">You can now:</h3>
              <ul style="margin: 15px 0; padding-left: 20px;">
                  <li><strong>Gain self-awareness</strong> of your leadership strengths and gaps</li>
                  <li>Download your comprehensive assessment report as a PDF</li>
                  <li>View your personalised radar chart of leadership competencies</li>
                  <li>Access AI-powered insights tailored to your results</li>
                  <li><strong>Build a targeted</strong> development plan for your gaps</li>
                  <li><strong>Track your progress</strong> over time</li>
              </ul>
              
              <p style="margin: 30px 0;">
                  <a href="https://www.leader-leap.com/profile" style="background-color: #C96736; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-transform: uppercase;">ACCESS YOUR DASHBOARD</a>
              </p>
              
              <p>Leader Leap helps you focus on the human skills that will define tomorrow's leaders - emotional intelligence, strategic thinking, and the ability to inspire and develop others.</p>
              
              <p>Ready to future-proof your leadership? I'd love to partner with you as your executive coach to turn these insights into real transformation.</p>
              
              <p style="margin: 30px 0;">
                  <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0S-SdZAlPQs8oLSzYyWXuXY7j5SIjRUCSOeq0yo7cz9VSHBKw5r6v9Lei3b7KlRr3UPRUMZmhE" style="background-color: #C96736; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-transform: uppercase;">BOOK A FREE DISCOVERY CALL</a>
              </p>
              
              <p>If you have any questions or need assistance, please don't hesitate to reach out to me directly.</p>
              
              <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>Steve Thompson</strong><br>
                  Leader Leap | Encourager Coaching<br>
                  <a href="mailto:steve.thompson@leader-leap.com">steve.thompson@leader-leap.com</a>
              </p>
              
              <div style="margin-top: 20px; font-size: 14px; color: #666;">
                  <p style="margin: 5px 0;">
                      Park Lodge, 60 London Road<br>
                      Horsham RH12 1AY
                  </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <div style="text-align: center; font-size: 12px; color: #666;">
                  <p style="margin: 5px 0;"><strong>Leader Leap - Future-Proof Your Leadership in the Age of AI</strong></p>
                  <p style="margin: 5px 0;">This email was sent to ${userEmail}. Generated on ${currentDate}.</p>
              </div>
              
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send welcome email:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResult = await emailResponse.json();

    // Update profile with email ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        welcome_email_id: emailResult.id 
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update profile with welcome email info:', updateError);
      // Don't fail the whole operation if tracking update fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        emailId: emailResult.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Welcome email function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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
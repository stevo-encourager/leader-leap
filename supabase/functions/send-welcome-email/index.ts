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

    const displayName = userName || profile?.first_name || 'there';
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
        subject: 'Welcome to Leader Leap - Your Account is Ready!',
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
              
              <p>Welcome to Leader Leap! Thank you for confirming your account and joining our leadership development community.</p>
              
              <p>Your account is now active and ready to use. You can log in at any time to:</p>
              
              <h3 style="color: #000000; margin-top: 30px; margin-bottom: 15px;">What you can access in your account:</h3>
              <ul style="margin: 15px 0; padding-left: 20px;">
                  <li>View your leadership assessment results</li>
                  <li>Download your comprehensive assessment report as a PDF</li>
                  <li>See your personalised radar chart of leadership competencies</li>
                  <li>Access AI-powered insights and recommendations</li>
                  <li>Create and manage action plans for your development</li>
                  <li>Track your progress over time</li>
              </ul>
              
              <p style="margin: 30px 0;">
                  <a href="https://www.leader-leap.com/profile" style="background-color: #2F564D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Dashboard</a>
              </p>
              
              <p>Leader Leap is designed to help you understand your leadership competencies and develop the skills needed to achieve your goals.</p>
              
              <p>Ready to take your leadership to the next level? Consider working with one of our expert coaches to turn insights into action.</p>
              
              <p style="margin: 30px 0;">
                  <a href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0S-SdZAlPQs8oLSzYyWXuXY7j5SIjRUCSOeq0yo7cz9VSHBKw5r6v9Lei3b7KlRr3UPRUMZmhE" style="background-color: #5fac9a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Book a Free Discovery Call</a>
              </p>
              
              <p>If you have any questions or need assistance, please don't hesitate to reach out to me directly.</p>
              
              <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>Steve Thompson</strong><br>
                  Leader Leap | Encourager Coaching<br>
                  <a href="mailto:steve@leader-leap.com">steve@leader-leap.com</a>
              </p>
              
              <div style="margin-top: 20px; font-size: 14px; color: #666;">
                  <p style="margin: 5px 0;">
                      Park Lodge, 60 London Road<br>
                      Horsham RH12 1AY
                  </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <div style="text-align: center; font-size: 12px; color: #666;">
                  <p style="margin: 5px 0;"><strong>Leader Leap - Empowering Leadership Development</strong></p>
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

    // Update profile with email sent timestamp and ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        welcome_email_sent_at: new Date().toISOString(),
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
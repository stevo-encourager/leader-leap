import { supabase } from '@/integrations/supabase/client';
import { logger } from './productionLogger';

interface SendWelcomeEmailParams {
  userId: string;
  userEmail: string;
  userName?: string;
}

export const sendWelcomeEmail = async ({
  userId,
  userEmail,
  userName,
}: SendWelcomeEmailParams): Promise<boolean> => {
  try {
    // Call the Edge Function to send simple welcome email
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        userId,
        userEmail,
        userName,
      },
    });

    if (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }

    if (data?.success) {
      logger.info('Welcome email sent successfully:', data.emailId);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return false;
  }
};

// Check if user is a new signup (registered in the last 10 minutes)
export const isRecentSignup = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (!profile?.created_at) {
      return false;
    }

    const signupTime = new Date(profile.created_at);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    return signupTime > tenMinutesAgo;
  } catch (error) {
    logger.error('Error checking signup time:', error);
    return false;
  }
};
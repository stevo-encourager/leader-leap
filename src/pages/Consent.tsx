import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getLocalAssessmentData, restoreAssessmentDataAfterVerification } from '@/services/assessment/manageAssessmentHistory';
import { saveAssessmentResults } from '@/services/assessment/saveAssessment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';



const Consent: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [gdprConsent, setGdprConsent] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [loading, setLoading] = useState(false);


  // Restore assessment data when consent page loads (after email verification)
  useEffect(() => {
    const restoreData = async () => {
      // Try to restore assessment data after email verification
      await restoreAssessmentDataAfterVerification(user.email);
    };
    
    restoreData();
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update the user's profile with consent and email preferences
      const { error } = await supabase
        .from('profiles')
        .update({
          gdpr_consent: gdprConsent,
          receive_emails: receiveEmails,
        })
        .eq('id', user.id);
      if (error) {
        toast({
          title: 'Error saving preferences',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      // If user consents to emails, subscribe to Brevo
      if (receiveEmails && user.email) {
        try {
          // Always use Supabase Edge Function for both development and production
          const result = await supabase.functions.invoke('brevo-subscribe', {
            body: { 
              email: user.email,
              firstName: user.user_metadata?.first_name,
              lastName: user.user_metadata?.surname
            }
          });
          
          const data = result.data;
          const error = result.error;
          if (!error && data?.success) {
            toast({
              title: 'Subscribed to email updates',
              description: 'You will receive leadership tips and updates.',
            });
          } else {
            toast({
              title: 'Email subscription failed',
              description: error?.message || data?.error || 'Could not subscribe to emails.',
              variant: 'destructive',
            });
          }
        } catch (err: any) {
          toast({
            title: 'Email subscription error',
            description: err.message,
            variant: 'destructive',
          });
        }
      }
      toast({
        title: 'Preferences saved',
        description: 'Thank you for confirming your consent and preferences.',
      });
      
      // Check if user has local assessment data that needs to be saved
      const localData = getLocalAssessmentData();
      if (localData && localData.categories && localData.categories.length > 0) {
        // User has assessment data, save it to the database first
        try {
          const result = await saveAssessmentResults(localData.categories, localData.demographics);
          if (result.success && result.data && result.data[0]?.id) {
            // Redirect to the specific assessment results page
            navigate(`/results/${result.data[0].id}`);
          } else {
            // Still redirect to results page, it will handle loading from local storage
            navigate('/results');
          }
        } catch (error) {
          // Still redirect to results page, it will handle loading from local storage
          navigate('/results');
        }
      } else {
        // No assessment data, redirect to home
        navigate('/');
      }

      // After saving preferences, associate temp assessments with real user ID
      const tempUserId = localStorage.getItem('temp_user_id');
      if (tempUserId && user && user.id && tempUserId !== user.id) {
        // Update all assessments with tempUserId to use the real user.id
        const { error: updateError } = await supabase
          .from('assessment_results')
          .update({ user_id: user.id })
          .eq('user_id', tempUserId);
        if (!updateError) {
          localStorage.removeItem('temp_user_id');
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Consent - Leader Leap" description="Consent page (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Dialog open>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-encourager mb-2 text-center">Consent & Preferences</DialogTitle>
              <DialogDescription className="text-slate-600 text-center mb-4">
                Please confirm your consent and email preferences to continue using the app.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={e => setGdprConsent(e.target.checked)}
                    required
                    className="accent-encourager mt-1"
                  />
                  <span>
                    I consent to Encourager Limited processing my personal data, including sharing anonymised assessment data (leadership scores and professional background) with AI services to generate personalised insights, as described in the{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-encourager hover:text-encourager-dark focus:outline-none"
                    >
                      Privacy Notice
                    </a>.
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={receiveEmails}
                    onChange={e => setReceiveEmails(e.target.checked)}
                    className="accent-encourager mt-1"
                  />
                  <span>Get free leadership tools, tips, and insights delivered to your inbox (just once a month, max)</span>
                </label>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={loading || !gdprConsent}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Consent;
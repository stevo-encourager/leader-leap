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

const PrivacyNoticeModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-3xl font-bold text-encourager mb-8">Privacy Notice</DialogTitle>
      </DialogHeader>
      <div className="prose prose-slate max-w-none space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Who We Are</h2>
          <p>
            Encourager Limited is the data controller for the personal information you provide to us. You can contact us at info@encourager.co.uk if you have any questions about how we handle your personal data.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">What Information We Collect</h2>
          <p>When you complete our leadership gap assessment, we collect:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Your name</li>
            <li>Your email address</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Why We Collect This Information</h2>
          <p>We collect your personal information for two purposes:</p>
          <ol className="list-decimal pl-6 mt-2 space-y-2">
            <li><strong>To deliver your assessment results</strong> - We need your email address to send you your personalised leadership gap assessment report</li>
            <li><strong>To keep in touch about executive coaching services</strong> - With your separate consent, we may contact you about our executive coaching services and related professional development opportunities</li>
          </ol>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Legal Basis for Processing</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>For delivering your assessment results:</strong> Your consent</li>
            <li><strong>For marketing communications:</strong> Your separate, explicit consent (which you can withdraw at any time)</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">How Long We Keep Your Information</h2>
          <p>
            We will keep your name and email address for up to 3 years from the date you complete the assessment. This allows us to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide ongoing support related to your assessment</li>
            <li>Send you relevant professional development information (if you've consented to marketing)</li>
            <li>Maintain records for business purposes</li>
          </ul>
          <p className="mt-2">
            After 3 years, we will securely delete your personal information unless you have engaged with our services or communications during that period.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Who We Share Your Information With</h2>
          <p>
            We do not share your personal information with any third parties. Your data stays with us.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Your Rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access your personal data</li>
            <li>Rectification</li>
            <li>Erasure</li>
            <li>Restrict processing</li>
            <li>Data portability</li>
            <li>Object</li>
            <li>Withdraw consent</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact us at info@encourager.co.uk.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">How We Protect Your Information</h2>
          <p>
            We take appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure or destruction.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Changes to This Privacy Notice</h2>
          <p>
            We may update this privacy notice from time to time. Any changes will be posted on this page with an updated revision date.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this privacy notice or how we handle your personal data, please contact us at info@encourager.co.uk.
          </p>
        </div>
        <div className="border-t pt-6 mt-8">
          <p className="text-sm text-slate-600 italic">
            Last updated: 9 July 2025
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const Consent: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [gdprConsent, setGdprConsent] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

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
          // For local development, use the local server; for production, use Supabase Edge Function
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          
          let data, error;
          
          if (isLocalhost) {
            // Use local server for development
            const response = await fetch('http://localhost:3001/api/subscribe-brevo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                email: user.email,
                firstName: userProfile?.first_name,
                lastName: userProfile?.surname
              })
            });
            
            const result = await response.json();
            data = result;
            error = response.ok ? null : result;
          } else {
            // Use Supabase Edge Function for production
            const result = await supabase.functions.invoke('brevo-subscribe', {
              body: { 
                email: user.email,
                firstName: userProfile?.first_name,
                lastName: userProfile?.surname
              }
            });
            data = result.data;
            error = result.error;
          }
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
                    I consent to Encourager Limited processing my personal data as described in the{' '}
                    <button
                      type="button"
                      className="underline text-encourager hover:text-encourager-dark focus:outline-none"
                      onClick={() => setPrivacyOpen(true)}
                    >
                      Privacy Notice
                    </button>.
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
                  <span>Receive emails about leadership tips and updates. MAX ONE EMAIL MONTH</span>
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
        <PrivacyNoticeModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      </div>
    </>
  );
};

export default Consent;
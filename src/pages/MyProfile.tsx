
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleGauge } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import AssessmentsList from '@/components/previous-assessments/AssessmentsList';
import EmptyAssessmentsList from '@/components/previous-assessments/EmptyAssessmentsList';
import ActionPlanComponent from '@/components/ActionPlan';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { getLatestAssessmentResults } from '@/services/assessment/fetchAssessment';
import { Demographics } from '@/utils/assessmentTypes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAssessment } from '@/hooks/useAssessment';
import { logger } from '@/utils/productionLogger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, initialized } = useAuth();
  const isMobile = useIsMobile();
  const { handleStartNewAssessment } = useAssessment();
  const {
    assessments,
    allAssessments,
    isLoading,
    isDeleting,
    totalAssessments,
    currentPage,
    pageSize,
    fetchAssessments,
    handleDeleteAssessment,
    handlePageChange
  } = useAssessmentHistory();

  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [demographicsLoading, setDemographicsLoading] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [emailPreferencesLoading, setEmailPreferencesLoading] = useState(false);

  useEffect(() => {
    if (!initialized) return; // Wait for auth to initialize
    
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAssessments();
    setLastRefreshed(new Date().toISOString());
    
    // Force refresh user profile to ensure we have latest data
    const refreshProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          // Update the email preferences state directly with fresh data
          const profileData = data as any;
          setReceiveEmails(profileData.receive_emails ?? true);
        }
      } catch (error) {
        logger.error('Error refreshing profile:', error);
      }
    };
    
    // Fetch the most recent demographic data
    const fetchDemographics = async () => {
      setDemographicsLoading(true);
      try {
        const result = await getLatestAssessmentResults(user?.id || '');
        if (result.success && result.data) {
          setDemographics(result.data.demographics);
        }
      } catch (error) {
        logger.error('Error fetching demographics:', error);
      } finally {
        setDemographicsLoading(false);
      }
    };
    
    fetchDemographics();
    refreshProfile();
  }, [initialized, user, navigate]);

  // Load current email preferences
  useEffect(() => {
    if (userProfile) {
      setReceiveEmails(userProfile.receive_emails ?? true);
    }
  }, [userProfile]);

  const handleRefresh = () => {
    fetchAssessments();
    setLastRefreshed(new Date().toISOString());
    toast({
      title: "Assessment list refreshed",
      description: "Showing all your assessments in chronological order"
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    // Require confirmation to match
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailPreferencesChange = async (newValue: boolean) => {
    if (!user) return;
    
    setEmailPreferencesLoading(true);
    try {
      // Update the database
      const { error } = await supabase
        .from('profiles')
        .update({ receive_emails: newValue })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update Brevo subscription
      if (newValue) {
        // Subscribe to Brevo
        const { data, error: brevoError } = await supabase.functions.invoke('brevo-subscribe', {
          body: { email: user.email }
        });
        
        if (brevoError) {
          logger.error('Brevo subscription error:', brevoError);
          toast({
            title: 'Email preferences updated',
            description: 'Your preferences were saved, but there was an issue with the email subscription.',
            variant: 'destructive',
          });
        } else if (data?.success) {
          toast({
            title: 'Email preferences updated',
            description: 'You will now receive leadership tips and updates.',
          });
        }
      } else {
        // Unsubscribe from Brevo (you'll need to create this function)
        const { data, error: brevoError } = await supabase.functions.invoke('brevo-unsubscribe', {
          body: { email: user.email }
        });
        
        if (brevoError) {
          logger.error('Brevo unsubscription error:', brevoError);
          toast({
            title: 'Email preferences updated',
            description: 'Your preferences were saved, but there was an issue with the email unsubscription.',
            variant: 'destructive',
          });
        } else if (data?.success) {
          toast({
            title: 'Email preferences updated',
            description: 'You have been unsubscribed from marketing emails.',
          });
        }
      }
      
      setReceiveEmails(newValue);
      
    } catch (err: any) {
      toast({
        title: 'Error updating preferences',
        description: err.message || 'Failed to update email preferences.',
        variant: 'destructive',
      });
    } finally {
      setEmailPreferencesLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    
    try {
  
      
      // Call the secure Edge Function for account deletion
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { user_id: user?.id }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.success) {
        throw new Error(data?.message || 'Failed to delete account');
      }
      
      // Success message logic - show confirmation before sign out and redirect
      toast({
        title: "Account deleted successfully",
        description: "Your account has been successfully deleted. We're sorry to see you go.",
      });
      
      // Small delay to ensure the success message is visible before redirect
      setTimeout(async () => {
        // Sign out and redirect after successful deletion
        await signOut();
        navigate('/');
      }, 2000);
      
    } catch (err: any) {
      // Provide clear error messages based on the error type
      let errorMessage = 'Failed to delete account.';
      
      if (err.message?.includes('Function not found')) {
        errorMessage = 'Account deletion service is currently unavailable. Please contact support for assistance.';
      } else if (err.message?.includes('unauthorized') || err.message?.includes('permission')) {
        errorMessage = 'You do not have permission to delete this account. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Delete account error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
          <p className="mt-2 text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Profile - Leader Leap" description="User profile (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-4xl px-4 py-8'}`}>
          <div className={isMobile ? 'w-full max-w-full overflow-hidden' : ''}>
            <h1 className="text-3xl font-bold text-encourager mb-8">My Profile</h1>
            
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-slate-700 font-montserrat">Personal Details</h2>
                    <div className="mb-4">
                      {userProfile?.full_name && (
                        <div className="mb-2 text-slate-700">
                          <span className="font-medium">Name:</span> {userProfile.full_name}
                        </div>
                      )}
                      <div className="mb-2 text-slate-700">
                        <span className="font-medium">Email:</span> {user?.email}
                      </div>
                    </div>
                    <div className="mt-4 hidden md:block">
                      <button
                        className="text-encourager underline text-sm mb-2 block"
                        onClick={() => setShowChangePassword((v) => !v)}
                      >
                        {showChangePassword ? 'Cancel' : 'Change Password'}
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="text-red-600 underline text-sm"
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? 'Deleting...' : 'Delete Account'}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your account? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {showChangePassword && (
                      <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-2 max-w-xs">
                        <input
                          type="password"
                          className="border rounded px-3 py-2"
                          placeholder="New password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                        <input
                          type="password"
                          className="border rounded px-3 py-2"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                        <button
                          type="submit"
                          className="bg-encourager text-white rounded px-3 py-2 mt-1"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                        {passwordMessage && (
                          <div className="text-sm text-center mt-1 text-encourager">
                            {passwordMessage}
                          </div>
                        )}
                      </form>
                      )}
                    </div>
                  </div>
                  
                  {demographics && (demographics.role || demographics.yearsOfExperience || demographics.industry) && (
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-slate-700 font-montserrat">Demographic Info</h3>
                      {demographics.role && (
                        <div className="mb-2 text-slate-700">
                          <span className="font-medium">Your Role:</span> {demographics.role}
                        </div>
                      )}
                      {demographics.industry && (
                        <div className="mb-2 text-slate-700">
                          <span className="font-medium">Industry:</span> {demographics.industry}
                        </div>
                      )}
                      {demographics.yearsOfExperience && (
                        <div className="mb-2 text-slate-700">
                          <span className="font-medium">Leadership Experience:</span> {demographics.yearsOfExperience}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Email Preferences Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="text-xl font-semibold mb-4 text-slate-700 font-montserrat">Email Preferences</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-preferences"
                      checked={receiveEmails}
                      onCheckedChange={handleEmailPreferencesChange}
                      disabled={emailPreferencesLoading}
                    />
                    <Label htmlFor="email-preferences" className="text-sm text-slate-700">
                      Receive leadership tips and updates (max one email per month)
                    </Label>
                  </div>
                  {emailPreferencesLoading && (
                    <p className="text-sm text-slate-500 mt-2">Updating preferences...</p>
                  )}
                  
                  {/* Mobile-only account actions */}
                  <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="text-encourager underline text-sm mb-2 block"
                      onClick={() => setShowChangePassword((v) => !v)}
                    >
                      {showChangePassword ? 'Cancel' : 'Change Password'}
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-red-600 underline text-sm"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your account? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {showChangePassword && (
                      <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-2 max-w-xs">
                        <input
                          type="password"
                          className="border rounded px-3 py-2"
                          placeholder="New password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                        <input
                          type="password"
                          className="border rounded px-3 py-2"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                        <button
                          type="submit"
                          className="bg-encourager text-white rounded px-3 py-2 mt-1"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                        {passwordMessage && (
                          <div className="text-sm text-center mt-1 text-encourager">
                            {passwordMessage}
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </div>
                

                

             </div>
           </div>

          <div className={`mb-8 ${isMobile ? 'flex justify-center' : 'flex justify-end'}`}>
            <Button 
              onClick={handleStartNewAssessment}
              className={`text-white ${isMobile ? 'w-full px-4 py-3' : 'px-6 py-3'}`}
              style={{ backgroundColor: '#2F564D' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3a6859'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2F564D'}
            >
              Start New Assessment
            </Button>
          </div>

          <div className="mb-8">
                          <h2 className="text-2xl font-semibold mb-4 text-encourager">Previous Assessments</h2>
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                Refresh List
              </Button>
            </div>
            {allAssessments.length === 0 ? (
              <EmptyAssessmentsList isLoading={isLoading} />
            ) : (
              <AssessmentsList
                assessments={assessments}
                currentPage={currentPage}
                pageSize={pageSize}
                totalAssessments={totalAssessments}
                onPageChange={handlePageChange}
                onDeleteAssessment={handleDeleteAssessment}
              />
            )}
            {lastRefreshed && (
              <p className={`text-xs text-slate-400 ${isMobile ? 'mt-12 text-center' : 'mt-4 text-right'}`}>
                Last updated: {new Date(lastRefreshed).toLocaleTimeString()}
                {' | '}
                Showing page {currentPage} of {Math.ceil(totalAssessments / pageSize)}
              </p>
            )}
          </div>

          {/* 6-Month Action Plan Section */}
          <ActionPlanComponent assessments={allAssessments} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MyProfile;

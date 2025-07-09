
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleGauge } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import AssessmentsList from '@/components/previous-assessments/AssessmentsList';
import EmptyAssessmentsList from '@/components/previous-assessments/EmptyAssessmentsList';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAssessments();
    setLastRefreshed(new Date().toISOString());
  }, [user, navigate]);

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
    try {
      const { error } = await import('@/integrations/supabase/client').then(({ supabase }) =>
        supabase.auth.updateUser({ password: newPassword })
      );
      if (error) throw error;
      setPasswordMessage('Password updated successfully.');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMessage(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete user account
      const { error } = await import('@/integrations/supabase/client').then(({ supabase }) =>
        supabase.auth.admin.deleteUser(user?.id || '')
      );
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Delete account error",
        description: err.message || 'Failed to delete account.',
        variant: "destructive",
      });
    }
  };

  const handleStartNewAssessment = () => {
    navigate('/assessment');
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-encourager mb-8">My Profile</h1>
        
        <div className="flex gap-8 mb-8">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">Account Details</h2>
              <div className="mb-4">
                <span className="font-medium">Email:</span> {user?.email}
              </div>
              <button
                className="text-encourager underline text-sm mb-2 block"
                onClick={() => setShowChangePassword((v) => !v)}
              >
                {showChangePassword ? 'Cancel' : 'Change Password'}
              </button>
              <button
                className="text-red-600 underline text-sm"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
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
          
          <div className="flex-shrink-0">
            <Button 
              onClick={handleStartNewAssessment}
              className="bg-encourager hover:bg-encourager-light text-white px-6 py-3"
            >
              Start New Assessment
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Previous Assessments</h2>
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
            <p className="mt-4 text-xs text-slate-400 text-right">
              Last updated: {new Date(lastRefreshed).toLocaleTimeString()}
              {' | '}
              Showing page {currentPage} of {Math.ceil(totalAssessments / pageSize)}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProfile;

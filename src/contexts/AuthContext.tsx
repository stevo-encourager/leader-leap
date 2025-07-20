import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  receive_emails?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, surname: string, receiveEmails: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loading: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAccountCreatedDialog, setShowAccountCreatedDialog] = useState(false);
  const [showAccountExistsDialog, setShowAccountExistsDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!initialized) {
          setInitialized(true);
        }

        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is a password reset flow
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
          const type = urlParams.get('type') || hashParams.get('type');
          
          if (accessToken && refreshToken && type === 'recovery') {
            // This is a password reset flow, redirect to the reset page with preserved parameters
            const currentUrl = window.location.href;
            const resetUrl = currentUrl.replace('/?', '/reset-password?').replace('/#', '/reset-password#');
            window.location.href = resetUrl;
            return;
          }
          
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        if (mounted) {
          console.error('AuthContext: Exception getting initial session:', error);
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          const profileData: any = data;
          setUserProfile({ ...profileData, is_admin: profileData.is_admin ?? false });
        } else {
          setUserProfile(null);
        }
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  React.useEffect(() => {
    if (initialized && user) {
      // Check if user is missing consent or preferences
      const checkConsent = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('gdpr_consent, receive_emails')
          .eq('id', user.id)
          .single();
        // Only redirect if consent is missing (null or false) or receive_emails is null
        if (!error && profile && (profile.gdpr_consent !== true || profile.receive_emails === null || typeof profile.receive_emails === 'undefined')) {
          navigate('/consent');
        }
      };
      checkConsent();
    }
  }, [initialized, user, navigate]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const signInData = {
        email: email.trim(),
        password,
      };
      
      const { data, error } = await supabase.auth.signInWithPassword(signInData);

      if (error) {
        console.error('AuthContext: Sign in error:', error);
        
        toast({
          title: "Error signing in",
          description: error.message || "Failed to sign in. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      if (data?.user && data?.session) {
        // Don't show success toast here - it will be shown by the auth state change handler
      } else {
        throw new Error('Sign in completed but no user session was created');
      }
    } catch (error) {
      console.error('AuthContext: Exception during sign in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, surname: string, receiveEmails: boolean) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('AuthContext: Attempting signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          surname: surname,
          receive_emails: receiveEmails,
        }
      }
    });

    console.log('AuthContext: Signup response:', { data, error, hasUser: !!data?.user, userConfirmedAt: data?.user?.email_confirmed_at });

    if (error) {
      console.error('AuthContext: Sign up error:', error);
      
      // Check for specific error messages that indicate existing email
      const errorMessage = error.message?.toLowerCase() || '';
      const isExistingEmail = errorMessage.includes('already registered') || 
                             errorMessage.includes('already exists') ||
                             errorMessage.includes('user already registered') ||
                             errorMessage.includes('email already exists') ||
                             errorMessage.includes('email address not confirmed') ||
                             errorMessage.includes('email not confirmed') ||
                             errorMessage.includes('signup is disabled') ||
                             error.status === 422 || // Common status for existing email
                             error.status === 400; // Another common status for validation errors
      
      if (isExistingEmail) {
        setShowAccountExistsDialog(true);
      } else {
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    }

    // For existing confirmed emails, Supabase returns success but the user will have email_confirmed_at set
    // and the signup essentially becomes a no-op
    if (data?.user?.email_confirmed_at) {
      console.log('AuthContext: User email already confirmed, likely existing account');
      setShowAccountExistsDialog(true);
      return;
    }

    // Check if signup was successful but user is null (indicates existing confirmed email)
    if (!error && !data.user) {
      console.log('AuthContext: No user returned, likely existing account');
      // This indicates the email already exists and is confirmed
      setShowAccountExistsDialog(true);
      return;
    }

    // Only show success dialog if we have a user and no errors
    if (data.user && !error) {
      console.log('AuthContext: Showing account created dialog');
      setShowAccountCreatedDialog(true);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // If session is missing, that means user is already signed out
        if (error.message === 'Auth session missing!') {
          console.log('AuthContext: Session already missing, clearing local state');
          // Clear local state manually since Supabase can't do it
          setUser(null);
          setSession(null);
          setUserProfile(null);
        } else {
          console.error('AuthContext: Sign out error:', error);
          toast({
            title: "Error signing out",
            description: error.message,
            variant: "destructive",
          });
          // Don't throw for session missing error, but do throw for other errors
          throw error;
        }
      } else {
        // Successful logout - state will be cleared by onAuthStateChange
        // but clear it immediately to ensure UI updates
        setUser(null);
        setSession(null);
        setUserProfile(null);
      }

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      // Handle session missing error gracefully
      if (error?.message === 'Auth session missing!' || error?.name === 'AuthSessionMissingError') {
        console.log('AuthContext: Session missing during logout, clearing local state');
        // Clear local state manually since Supabase can't do it
        setUser(null);
        setSession(null);
        setUserProfile(null);
        
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else {
        // Re-throw other errors
        throw error;
      }
    }
    
    // Navigate to home page after sign out (successful or session missing)
    navigate('/');
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (error) {
      console.error('AuthContext: Google sign in error:', error);
      toast({
        title: "Error with Google sign in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('AuthContext: Password reset error:', error);
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Reset email sent",
      description: "Check your email for password reset instructions.",
    });
  };

  const value = {
    user,
    session,
    userProfile,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    forgotPassword,
    loading,
    initialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Account Created Success Dialog */}
      <Dialog open={showAccountCreatedDialog} onOpenChange={setShowAccountCreatedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Created Successfully</DialogTitle>
            <DialogDescription>
              Please check your email to verify your account before signing in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAccountCreatedDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Already Exists Dialog */}
      <Dialog open={showAccountExistsDialog} onOpenChange={setShowAccountExistsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Already Exists</DialogTitle>
            <DialogDescription>
              An account with this email address already exists.
              <br />
              Please use the 'Forgot password?' link in the Login section to reset your password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAccountExistsDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};
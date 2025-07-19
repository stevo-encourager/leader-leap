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
    console.log('AuthContext: Setting up auth state listener');
    
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthContext: Auth state changed:', event, session?.user?.email || 'No user');
        console.log('AuthContext: Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          userEmailConfirmed: session?.user?.email_confirmed_at
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check super admin status for debugging
        if (session?.user?.email) {
          const superAdmins = ['steve@encourager.co.uk'];
          const isSuperAdmin = superAdmins.some(
            email => email.toLowerCase() === session.user.email.toLowerCase().trim()
          );
          console.log('AuthContext: Super admin check:', {
            userEmail: session.user.email,
            isSuperAdmin: isSuperAdmin,
            superAdmins: superAdmins
          });
        }
        
        if (!initialized) {
          setInitialized(true);
        }

        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext: User successfully signed in:', session.user.email);
          
          // Check if this is a password reset flow
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
          const type = urlParams.get('type') || hashParams.get('type');
          
          if (accessToken && refreshToken && type === 'recovery') {
            console.log('AuthContext: Password reset flow detected, redirecting to reset page');
            // This is a password reset flow, redirect to the reset page with preserved parameters
            const currentUrl = window.location.href;
            const resetUrl = currentUrl.replace('/?', '/reset-password?').replace('/#', '/reset-password#');
            window.location.href = resetUrl;
            return;
          }
          
          // Debug: Check if there's local assessment data that should be preserved
          try {
            const localData = localStorage.getItem('assessment_categories');
            console.log('AuthContext: Local assessment data after sign in:', localData ? 'exists' : 'none');
            if (localData) {
              console.log('AuthContext: Local data length:', localData.length);
            }
          } catch (error) {
            console.log('AuthContext: Error checking local data:', error);
          }
          
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out');
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        } else {
          console.log('AuthContext: Initial session loaded:', {
            hasSession: !!session,
            userEmail: session?.user?.email || 'No session'
          });
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
      console.log('AuthContext: Cleaning up auth subscription');
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
          console.log('AuthContext: Redirecting to consent page');
          
          // Debug: Check local data before redirect
          try {
            const localData = localStorage.getItem('assessment_categories');
            console.log('AuthContext: Local assessment data before consent redirect:', localData ? 'exists' : 'none');
            if (localData) {
              console.log('AuthContext: Local data length before redirect:', localData.length);
            }
          } catch (error) {
            console.log('AuthContext: Error checking local data before redirect:', error);
          }
          
          navigate('/consent');
        }
      };
      checkConsent();
    }
  }, [initialized, user, navigate]);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: signIn method called - START');
    console.log('AuthContext: signIn email:', email);
    console.log('AuthContext: signIn timestamp:', new Date().toISOString());
    
    setLoading(true);
    
    try {
      console.log('AuthContext: About to call supabase.auth.signInWithPassword');
      console.log('AuthContext: Supabase client exists:', !!supabase);
      console.log('AuthContext: Supabase auth exists:', !!supabase.auth);
      
      const signInData = {
        email: email.trim(),
        password,
      };
      
      console.log('AuthContext: Calling signInWithPassword with:', {
        email: signInData.email,
        hasPassword: !!signInData.password,
        passwordLength: signInData.password?.length
      });
      
      const { data, error } = await supabase.auth.signInWithPassword(signInData);

      console.log('AuthContext: signInWithPassword response received');
      console.log('AuthContext: signInWithPassword response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userEmail: data?.user?.email,
        error: error?.message || 'No error'
      });

      if (error) {
        console.error('AuthContext: Sign in error:', error);
        console.error('AuthContext: Error details:', {
          message: error.message,
          status: error.status
        });
        
        toast({
          title: "Error signing in",
          description: error.message || "Failed to sign in. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      if (data?.user && data?.session) {
        console.log('AuthContext: Sign in successful for user:', data.user.email);
        console.log('AuthContext: Session created successfully');
        // Don't show success toast here - it will be shown by the auth state change handler
      } else {
        console.warn('AuthContext: Sign in completed but no user/session in response');
        console.warn('AuthContext: Data object:', data);
        throw new Error('Sign in completed but no user session was created');
      }
    } catch (error) {
      console.error('AuthContext: Exception during sign in:', error);
      console.error('AuthContext: Exception type:', typeof error);
      console.error('AuthContext: Exception constructor:', error?.constructor?.name);
      throw error;
    } finally {
      console.log('AuthContext: Setting loading to false');
      setLoading(false);
      console.log('AuthContext: signIn method - END');
    }
  };

  const signUp = async (email: string, password: string, firstName: string, surname: string, receiveEmails: boolean) => {
    console.log('AuthContext: Signing up user with data:', {
      email,
      firstName,
      surname,
      receiveEmails,
    });

    const redirectUrl = `${window.location.origin}/`;
    
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

    if (error) {
      console.error('AuthContext: Sign up error:', error);
      
      // Check for specific error messages that indicate existing email
      const errorMessage = error.message?.toLowerCase() || '';
      const isExistingEmail = errorMessage.includes('already registered') || 
                             errorMessage.includes('already exists') ||
                             errorMessage.includes('user already registered') ||
                             errorMessage.includes('email already exists') ||
                             error.status === 422; // Common status for existing email
      
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

    // Only show success dialog if we have a user and no errors
    if (data.user && !error) {
      console.log('AuthContext: User created successfully:', data.user.id);
      console.log('AuthContext: User metadata after signup:', data.user.user_metadata);
      
      // The profile will be created automatically by the database trigger
      // No need to manually upsert the profile
      console.log('AuthContext: Profile will be created automatically by database trigger');

      setShowAccountCreatedDialog(true);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('AuthContext: Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    
    // Navigate to home page after successful sign out
    navigate('/');
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    console.log('AuthContext: Google sign in redirectUrl:', redirectUrl);
    console.log('AuthContext: Starting Google sign in');
    
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
    console.log('AuthContext: Sending password reset email to:', email);
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

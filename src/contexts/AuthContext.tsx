
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getLocalAssessmentData, clearLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';
import { saveAssessmentResults } from '@/services/assessment/saveAssessment';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, receiveEmails: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationAttempted, setMigrationAttempted] = useState(false);

  // Function to migrate local assessment data to the user's account
  const migrateLocalAssessmentData = async (currentUser: User) => {
    try {
      // Skip if we've already attempted migration for this session
      if (migrationAttempted) {
        console.log('Migration already attempted this session, skipping');
        return;
      }
      
      const localData = getLocalAssessmentData();
      
      console.log('Checking for local data to migrate:', {
        hasLocalData: !!localData,
        categoriesCount: localData?.categories?.length || 0,
        timestamp: localData?.timestamp || 'none'
      });
      
      if (!localData || !localData.categories || localData.categories.length === 0) {
        console.log('No local assessment data found to migrate');
        setMigrationAttempted(true);
        return;
      }
      
      // Verify that the categories data contains valid ratings
      const hasValidRatings = localData.categories.some(category => 
        category && category.skills && Array.isArray(category.skills) &&
        category.skills.some(skill => {
          if (!skill || !skill.ratings) return false;
          
          const current = typeof skill.ratings.current === 'number' ? skill.ratings.current : 0;
          const desired = typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0;
          
          return current > 0 || desired > 0;
        })
      );
      
      if (!hasValidRatings) {
        console.warn('Local assessment data found but contains no valid ratings, skipping migration');
        setMigrationAttempted(true);
        return;
      }
      
      console.log('Valid local assessment data found, migrating to user account:', currentUser.id);
      
      // Deep clone the data to avoid reference issues
      const categoriesToMigrate = JSON.parse(JSON.stringify(localData.categories));
      const demographicsToMigrate = localData.demographics || {};
      
      // Log a sample of what we're migrating
      if (categoriesToMigrate.length > 0 && categoriesToMigrate[0].skills && categoriesToMigrate[0].skills.length > 0) {
        console.log('First skill being migrated:', 
          JSON.stringify({
            category: categoriesToMigrate[0].title,
            skill: categoriesToMigrate[0].skills[0].name,
            ratings: categoriesToMigrate[0].skills[0].ratings
          })
        );
      }
      
      // Save the local assessment data to the user's account
      const result = await saveAssessmentResults(categoriesToMigrate, demographicsToMigrate);
      
      if (result.success) {
        console.log('Successfully migrated local assessment data to user account:', result);
        toast({
          title: "Assessment data migrated",
          description: "Your previous assessment results have been saved to your account.",
        });
        
        // Clear the local data after successful migration
        clearLocalAssessmentData();
      } else {
        console.error('Failed to migrate local assessment data:', result.error);
        toast({
          title: "Migration issue",
          description: "There was a problem saving your previous results to your account. Try clicking 'Load Previous Results'.",
          variant: "destructive",
        });
      }
      
      // Mark migration as attempted regardless of result to prevent multiple attempts
      setMigrationAttempted(true);
    } catch (error) {
      console.error('Error migrating local assessment data:', error);
      setMigrationAttempted(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`Auth state changed: ${event}`, currentSession?.user?.id || 'no user');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          // Reset migration attempted flag on sign out
          setMigrationAttempted(false);
          
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        } else if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in",
            description: "Welcome back!",
          });
          
          // When user signs in, check for and migrate local assessment data
          if (currentSession?.user) {
            // Use setTimeout to avoid potential Supabase auth callback deadlock
            setTimeout(() => {
              migrateLocalAssessmentData(currentSession.user);
            }, 0);
          }
        } else if (event === 'USER_UPDATED') {
          // This fires when a user verifies their email
          console.log('User updated event received');
          
          if (currentSession?.user) {
            // Check if this is a new verification by looking at the email confirmed timestamp
            const emailConfirmedAt = currentSession.user.email_confirmed_at;
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            
            // If email was confirmed in the last 5 minutes, try to migrate data
            if (emailConfirmedAt && new Date(emailConfirmedAt) > fiveMinutesAgo) {
              console.log('Recent email verification detected, checking for local data to migrate');
              
              // Use setTimeout to avoid potential Supabase auth callback deadlock
              setTimeout(() => {
                migrateLocalAssessmentData(currentSession.user);
              }, 0);
            }
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id || 'no session');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      // If user is already authenticated, check for local data to migrate
      if (currentSession?.user) {
        console.log('User already authenticated on page load, checking for data migration');
        migrateLocalAssessmentData(currentSession.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, receiveEmails: boolean) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            receive_emails: receiveEmails,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Please check your email for a verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign in error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google sign in error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

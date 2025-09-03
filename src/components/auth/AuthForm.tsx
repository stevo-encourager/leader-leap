
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { preserveAssessmentDataForVerification } from '@/services/assessment/manageAssessmentHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { logger } from '@/utils/productionLogger';

// Define the props interface with onSuccess and defaultTab
export interface AuthFormProps {
  onSuccess?: () => void;
  showGoogleAuth?: boolean;
  defaultTab?: 'signin' | 'signup';
}

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Surname is required" }),
  receiveEmails: z.boolean().optional(),
}).refine((data) => {
  return true;
}, {
  // No consent required at signup
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, showGoogleAuth = true, defaultTab = 'signin' }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, signInWithGoogle, forgotPassword, loading } = useAuth();
  
  // Separate forms for sign-in and sign-up
  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      surname: '',
    }
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsSubmitting(true);
    
    try {
      await signIn(data.email, data.password);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in AuthContext, but let's add a fallback
      if (!error?.message?.includes('already handled')) {
        toast({
          title: "Sign in failed",
          description: error?.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsSubmitting(true);

    try {
      // Preserve assessment data before email verification process
      await preserveAssessmentDataForVerification(data.email);
      
      await signUp(data.email, data.password, data.firstName, data.surname, false); // Pass false for receiveEmails so user gets redirected to consent page
      // Don't call onSuccess here as the user needs to verify their email
      
      // Keep button disabled for a moment to show the loading state
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      // Error is already handled in AuthContext with toast
      // Keep button disabled for a moment even on error to prevent rapid clicking
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    
    try {
      await signInWithGoogle();
      // onSuccess is called in AuthContext when the redirect happens
    } catch (error) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(false);
    setIsSubmitting(true);
    
    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (error) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="signin">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        {showForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Password Reset Email
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
              Back to Sign In
            </Button>
            {forgotSent && (
              <p className="text-green-600 text-center text-sm">If an account exists for that email, a reset link has been sent.</p>
            )}
          </form>
        ) : (
          <>
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!signInForm.formState.errors.email}
                  aria-describedby={signInForm.formState.errors.email ? "email-error" : undefined}
                  {...signInForm.register('email')}
                />
                {signInForm.formState.errors.email && (
                  <p 
                    id="email-error" 
                    className="text-sm text-red-500" 
                    role="alert"
                    aria-live="polite"
                  >
                    {signInForm.formState.errors.email.message as string}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!signInForm.formState.errors.password}
                    aria-describedby={signInForm.formState.errors.password ? "password-error" : undefined}
                    {...signInForm.register('password')}
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p 
                    id="password-error" 
                    className="text-sm text-red-500" 
                    role="alert"
                    aria-live="polite"
                  >
                    {signInForm.formState.errors.password.message as string}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
            <div className="mt-2 text-center">
              <button
                type="button"
                className="text-sm text-encourager underline hover:text-encourager-dark"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>
            </div>
          </>
        )}
        {showGoogleAuth && !showForgot && (
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground mb-4">Or continue with</p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { 
             
                handleGoogleSignIn(); 
              }}
              disabled={isLoading}
              className="w-full"
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="h-5 w-5 mr-2" />
              Google
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="signup">
        {showGoogleAuth && (
          <div className="mb-6 text-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="h-5 w-5 mr-2" />
              Sign up with Google
            </Button>
            <div className="mt-4 mb-4 flex items-center">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-4 text-sm text-muted-foreground">Or continue with email</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>
          </div>
        )}
        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName"
              placeholder="John"
              required
              aria-invalid={!!signUpForm.formState.errors.firstName}
              aria-describedby={signUpForm.formState.errors.firstName ? "firstName-error" : undefined}
              {...signUpForm.register('firstName')}
            />
            {signUpForm.formState.errors.firstName && (
              <p 
                id="firstName-error" 
                className="text-sm text-red-500" 
                role="alert"
                aria-live="polite"
              >
                {signUpForm.formState.errors.firstName.message as string}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="surname">Surname</Label>
            <Input 
              id="surname"
              placeholder="Doe"
              required
              aria-invalid={!!signUpForm.formState.errors.surname}
              aria-describedby={signUpForm.formState.errors.surname ? "surname-error" : undefined}
              {...signUpForm.register('surname')}
            />
            {signUpForm.formState.errors.surname && (
              <p 
                id="surname-error" 
                className="text-sm text-red-500" 
                role="alert"
                aria-live="polite"
              >
                {signUpForm.formState.errors.surname.message as string}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailSignup">Email</Label>
            <Input 
              id="emailSignup"
              type="email"
              placeholder="you@example.com"
              aria-invalid={!!signUpForm.formState.errors.email}
              aria-describedby={signUpForm.formState.errors.email ? "emailSignup-error" : undefined}
              {...signUpForm.register('email')}
            />
            {signUpForm.formState.errors.email && (
              <p 
                id="emailSignup-error" 
                className="text-sm text-red-500" 
                role="alert"
                aria-live="polite"
              >
                {signUpForm.formState.errors.email.message as string}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passwordSignup">Password</Label>
            <div className="relative">
              <Input 
                id="passwordSignup"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                aria-invalid={!!signUpForm.formState.errors.password}
                aria-describedby={signUpForm.formState.errors.password ? "passwordSignup-error" : undefined}
                {...signUpForm.register('password')}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {signUpForm.formState.errors.password && (
              <p 
                id="passwordSignup-error" 
                className="text-sm text-red-500" 
                role="alert"
                aria-live="polite"
              >
                {signUpForm.formState.errors.password.message as string}
              </p>
            )}
          </div>
          
          {/* Removed GDPR consent and receive emails checkboxes from signup form */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground text-center">
            By signing up, you agree to our Terms of Service and{' '}
            <a href="/privacy-notice" className="underline text-encourager hover:text-encourager-dark" target="_blank" rel="noopener noreferrer">
              Privacy Notice
            </a>.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;

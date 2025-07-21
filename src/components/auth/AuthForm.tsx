
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const handleSignIn = async (data: any) => {
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

  const handleSignUp = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Preserve assessment data before email verification process
      console.log('AuthForm: Preserving assessment data before signup');
      await preserveAssessmentDataForVerification(data.email);
      
      await signUp(data.email, data.password, data.firstName, data.surname, null); // Pass null for receiveEmails so user gets redirected to consent page
      // Don't call onSuccess here as the user needs to verify their email
    } catch (error) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
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
                  {...signInForm.register('email')}
                />
                {signInForm.formState.errors.email && <p className="text-sm text-red-500">{signInForm.formState.errors.email.message as string}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...signInForm.register('password')}
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {signInForm.formState.errors.password && <p className="text-sm text-red-500">{signInForm.formState.errors.password.message as string}</p>}
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
        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName"
              placeholder="John"
              {...signUpForm.register('firstName')}
            />
            {signUpForm.formState.errors.firstName && <p className="text-sm text-red-500">{signUpForm.formState.errors.firstName.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="surname">Surname</Label>
            <Input 
              id="surname"
              placeholder="Doe"
              {...signUpForm.register('surname')}
            />
            {signUpForm.formState.errors.surname && <p className="text-sm text-red-500">{signUpForm.formState.errors.surname.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailSignup">Email</Label>
            <Input 
              id="emailSignup"
              type="email"
              placeholder="you@example.com"
              {...signUpForm.register('email')}
            />
            {signUpForm.formState.errors.email && <p className="text-sm text-red-500">{signUpForm.formState.errors.email.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passwordSignup">Password</Label>
            <div className="relative">
              <Input 
                id="passwordSignup"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...signUpForm.register('password')}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {signUpForm.formState.errors.password && <p className="text-sm text-red-500">{signUpForm.formState.errors.password.message as string}</p>}
          </div>
          
          {/* Removed GDPR consent and receive emails checkboxes from signup form */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>
        {showGoogleAuth && (
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground mb-4">Or continue with</p>
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
          </div>
        )}
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

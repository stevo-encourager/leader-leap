
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
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

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().optional(),
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
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      receiveEmails: true,
    }
  });

  const receiveEmails = watch('receiveEmails');

  console.log('AuthForm: Component rendered with activeTab:', activeTab);
  console.log('AuthForm: receiveEmails value:', receiveEmails);

  const handleSignIn = async (data: any) => {
    console.log('AuthForm: handleSignIn called - START');
    console.log('AuthForm: handleSignIn called with email:', data.email);
    console.log('AuthForm: handleSignIn data object:', { 
      email: data.email, 
      hasPassword: !!data.password,
      passwordLength: data.password?.length 
    });
    
    setIsSubmitting(true);
    
    try {
      console.log('AuthForm: About to call signIn method from AuthContext');
      console.log('AuthForm: signIn function exists:', typeof signIn === 'function');
      
      await signIn(data.email, data.password);
      console.log('AuthForm: signIn completed successfully');
      
      if (onSuccess) {
        console.log('AuthForm: Calling onSuccess callback');
        onSuccess();
      }
    } catch (error) {
      console.error('AuthForm: Sign in failed with error:', error);
      console.error('AuthForm: Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      });
      // Error handling is done in AuthContext, but let's add a fallback
      if (!error?.message?.includes('already handled')) {
        toast({
          title: "Sign in failed",
          description: error?.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      console.log('AuthForm: Setting isSubmitting to false');
      setIsSubmitting(false);
    }
    
    console.log('AuthForm: handleSignIn - END');
  };

  const handleSignUp = async (data: any) => {
    console.log('AuthForm: handleSignUp called with data:', {
      email: data.email,
      fullName: data.fullName,
      receiveEmails: data.receiveEmails,
    });
    
    setIsSubmitting(true);

    try {
      console.log('AuthForm: About to call signUp');
      await signUp(data.email, data.password, data.fullName || '', data.receiveEmails || false);
      console.log('AuthForm: Sign up completed successfully');
      // Don't call onSuccess here as the user needs to verify their email
    } catch (error) {
      console.error('AuthForm: Sign up failed:', error);
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('AuthForm: Starting Google sign in');
    setIsSubmitting(true);
    
    try {
      await signInWithGoogle();
      // onSuccess is called in AuthContext when the redirect happens
    } catch (error) {
      console.error('AuthForm: Google sign in failed:', error);
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AuthForm: Sending password reset for:', forgotEmail);
    setForgotSent(false);
    setIsSubmitting(true);
    
    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (error) {
      console.error('AuthForm: Password reset failed:', error);
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: any) => {
    console.log('AuthForm: onSubmit handler called - FORM SUBMISSION TRIGGERED');
    console.log('AuthForm: onSubmit data:', { 
      email: data.email, 
      hasPassword: !!data.password,
      // Removed receiveEmails and gdprConsent from log
      activeTab: activeTab,
      timestamp: new Date().toISOString()
    });
    
    // Check form validation errors
    console.log('AuthForm: Form errors:', errors);
    
    try {
      console.log('AuthForm: About to check activeTab:', activeTab);
      
      if (activeTab === 'signin') {
        console.log('AuthForm: Calling handleSignIn for signin tab');
        await handleSignIn(data);
        console.log('AuthForm: handleSignIn completed');
      } else if (activeTab === 'signup') {
        console.log('AuthForm: Calling handleSignUp for signup tab');
        await handleSignUp(data);
        console.log('AuthForm: handleSignUp completed');
      }
    } catch (error) {
      console.error('AuthForm: onSubmit error:', error);
    }
    
    console.log('AuthForm: onSubmit handler - END');
  };

  const isLoading = loading || isSubmitting;

  console.log('AuthForm: Render state:', {
    activeTab,
    isLoading,
    loading,
    isSubmitting,
    signInExists: typeof signIn === 'function'
  });

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" onClick={() => console.log('AuthForm: Form clicked')}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                onClick={() => console.log('AuthForm: Sign In button clicked')}
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
                console.log('DEBUG: Google button clicked'); 
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailSignup">Email</Label>
            <Input 
              id="emailSignup"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passwordSignup">Password</Label>
            <div className="relative">
              <Input 
                id="passwordSignup"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register('password')}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox 
                id="receiveEmails"
                checked={receiveEmails}
                onCheckedChange={(checked) => setValue('receiveEmails', checked as boolean)}
              />
              <Label htmlFor="receiveEmails" className="text-sm leading-relaxed">
                Receive emails about leadership tips and updates (max one email per month)
              </Label>
            </div>
          </div>
          
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

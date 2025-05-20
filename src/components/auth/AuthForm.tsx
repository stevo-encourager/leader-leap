
// Update the AuthForm component to include the onSuccess prop
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

// Define the props interface with onSuccess
export interface AuthFormProps {
  onSuccess?: () => void;
  showGoogleAuth?: boolean;
}

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().optional(),
  receiveEmails: z.boolean().optional(),
});

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, showGoogleAuth = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      receiveEmails: false
    }
  });

  const handleSignIn = async (data: any) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: any) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName || '', data.receiveEmails || false);
      // Don't call onSuccess here as the user needs to verify their email
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // onSuccess is called in AuthContext when the redirect happens
    } catch (error) {
      // Error is handled in AuthContext
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="you@example.com"
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
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
              Google
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="signup">
        <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
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
          
          <div className="flex items-center space-x-2">
            <Checkbox id="receiveEmails" {...register('receiveEmails')} />
            <Label htmlFor="receiveEmails" className="text-sm">Receive emails about leadership tips and updates</Label>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;

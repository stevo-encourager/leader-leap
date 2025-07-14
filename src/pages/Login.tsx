
import React from 'react';
import { Card } from '@/components/ui/card';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import SEO from '@/components/SEO';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <>
      <SEO title="Login - Leader Leap" description="Login page (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-encourager mb-2">Login or Sign Up</h1>
            <p className="text-slate-600">
              Access your previous assessment results
            </p>
          </div>
          <AuthForm onSuccess={() => navigate('/')} showGoogleAuth={true} />
        </Card>
      </div>
    </>
  );
};

export default Login;

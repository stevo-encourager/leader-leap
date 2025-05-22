
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ResetAppButton from '@/components/admin/ResetAppButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearLocalStorageData } from '@/services/resetApp';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // For testing purposes, we're showing admin controls to everyone
  useEffect(() => {
    // In a production app, you'd check for admin role here
    // For now, we'll just check if the user is authenticated
    setShowAdminControls(!!user);
    
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleClearLocalStorage = () => {
    clearLocalStorageData();
    toast({
      title: "Local storage cleared",
      description: "All local assessment data has been removed",
    });
  };
  
  if (!user) {
    return <div className="p-8">Redirecting to login...</div>;
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-red-600 mb-8">Admin Controls</h1>
        
        <div className="grid gap-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
              <CardDescription>These actions can permanently delete data and cannot be undone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Reset Application</h3>
                <p className="text-sm text-slate-600 mb-4">
                  This will delete ALL users and assessment data from the database and clear local storage.
                </p>
                <ResetAppButton />
              </div>
              
              <div className="pt-4 border-t border-red-200">
                <h3 className="font-semibold mb-2">Clear Local Storage Only</h3>
                <p className="text-sm text-slate-600 mb-4">
                  This will only clear assessment data from your browser's local storage.
                </p>
                <Button variant="outline" className="border-red-300" onClick={handleClearLocalStorage}>
                  Clear Local Storage
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-red-100/50 text-xs text-red-700 italic">
              <p>For testing and development purposes only.</p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;

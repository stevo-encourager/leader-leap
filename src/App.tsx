
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import PreviousAssessments from "./pages/PreviousAssessments";
import Admin from "./pages/Admin";
import PrivacyNotice from "./pages/PrivacyNotice";
import NotFound from "./pages/NotFound";
import AITestPanel from './pages/AITestPanel';
import React from 'react';
import MyProfile from "./pages/MyProfile";
import Consent from './pages/Consent';
import ResetPassword from './pages/ResetPassword';

// Configure the QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

function SuperAdminRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const superAdmins = ['steve@encourager.co.uk'];
  
  // Wait for auth to be initialized
  if (!initialized) {

    return <div>Loading auth...</div>;
  }
  
  if (loading) {

    return <div>Loading...</div>;
  }
  
  if (!user) {

    return <Navigate to="/login" />;
  }
  
  const userEmail = (user.email || '').toLowerCase().trim();
  const isSuperAdmin = superAdmins.some(
    email => email.toLowerCase() === userEmail
  );
  

  
  if (!isSuperAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/results" element={<Results />} />
                <Route path="/results/:id" element={<Results />} />
                <Route path="/previous-assessments" element={<PreviousAssessments />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/consent" element={<Consent />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={
                  <SuperAdminRoute>
                    <Admin />
                  </SuperAdminRoute>
                } />
                <Route path="/privacy-notice" element={<PrivacyNotice />} />
                <Route path="/ai-test-panel" element={
                  <SuperAdminRoute>
                    <AITestPanel />
                  </SuperAdminRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

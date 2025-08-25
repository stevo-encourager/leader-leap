
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

import Admin from "./pages/Admin";
import PrivacyNotice from "./pages/PrivacyNotice";
import NotFound from "./pages/NotFound";
import AITestPanel from './pages/AITestPanel';
import React, { useEffect } from 'react';
import MyProfile from "./pages/MyProfile";
import Consent from './pages/Consent';
import ResetPassword from './pages/ResetPassword';
import ErrorBoundary from "@/components/ErrorBoundary";

// Configure the QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && error.message.includes('401') || error.message.includes('403')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
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

// Focus management component to handle iframe accessibility issues
function FocusManager() {
  useEffect(() => {
    // Handle focus management for embedded iframes
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the focused element is inside an iframe
      if (target.closest('iframe')) {
        // Ensure the iframe container doesn't have aria-hidden
        const iframe = target.closest('iframe');
        if (iframe && iframe.parentElement) {
          const parent = iframe.parentElement;
          if (parent.getAttribute('aria-hidden') === 'true') {
            // Temporarily remove aria-hidden to allow focus
            parent.removeAttribute('aria-hidden');
            
            // Restore aria-hidden after a short delay
            setTimeout(() => {
              if (parent && !parent.contains(document.activeElement)) {
                parent.setAttribute('aria-hidden', 'true');
              }
            }, 100);
          }
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <FocusManager />
            <BrowserRouter>
              <ErrorBoundary>
                <AuthProvider>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={
                        <ErrorBoundary>
                          <Index />
                        </ErrorBoundary>
                      } />
                      <Route path="/login" element={
                        <ErrorBoundary>
                          <Login />
                        </ErrorBoundary>
                      } />
                      <Route path="/assessment" element={
                        <ErrorBoundary>
                          <Assessment />
                        </ErrorBoundary>
                      } />
                      <Route path="/results" element={
                        <ErrorBoundary>
                          <Results />
                        </ErrorBoundary>
                      } />
                      <Route path="/results/:id" element={
                        <ErrorBoundary>
                          <Results />
                        </ErrorBoundary>
                      } />
                      
                      <Route path="/profile" element={
                        <ErrorBoundary>
                          <MyProfile />
                        </ErrorBoundary>
                      } />
                      <Route path="/consent" element={
                        <ErrorBoundary>
                          <Consent />
                        </ErrorBoundary>
                      } />
                      <Route path="/reset-password" element={
                        <ErrorBoundary>
                          <ResetPassword />
                        </ErrorBoundary>
                      } />
                      <Route path="/admin" element={
                        <ErrorBoundary>
                          <SuperAdminRoute>
                            <Admin />
                          </SuperAdminRoute>
                        </ErrorBoundary>
                      } />
                      <Route path="/privacy-notice" element={
                        <ErrorBoundary>
                          <PrivacyNotice />
                        </ErrorBoundary>
                      } />
                      <Route path="/ai-test-panel" element={
                        <ErrorBoundary>
                          <SuperAdminRoute>
                            <AITestPanel />
                          </SuperAdminRoute>
                        </ErrorBoundary>
                      } />
                      <Route path="*" element={
                        <ErrorBoundary>
                          <NotFound />
                        </ErrorBoundary>
                      } />
                    </Routes>
                  </ErrorBoundary>
                </AuthProvider>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

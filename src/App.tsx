import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import PreviousAssessments from "./pages/PreviousAssessments";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import AITestPanel from './pages/AITestPanel';
import React from 'react';
import MyProfile from "./pages/MyProfile";

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
  const { user } = useAuth();
  const superAdmins = ['steve@chainpace.io', 'steve@encourager.co.uk'];
  if (!user || !superAdmins.includes(user.email)) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
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
              <Route path="/admin" element={
                <SuperAdminRoute>
                  <Admin />
                </SuperAdminRoute>
              } />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/privacy-policy" element={<Privacy />} />
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
  );
}

export default App;

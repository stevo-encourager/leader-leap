
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Assessment from '@/pages/Assessment';
import Results from '@/pages/Results';
import PreviousAssessments from '@/pages/PreviousAssessments';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import TestComponents from '@/pages/TestComponents';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/previous-assessments" element={<PreviousAssessments />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/test-components" element={<TestComponents />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

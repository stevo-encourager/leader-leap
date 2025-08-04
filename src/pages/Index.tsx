
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { allCategories } from '@/utils/assessmentCategories';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import IntroductionPage from '@/components/IntroductionPage';
import { useAssessment } from '@/hooks/useAssessment';
import SEO from '@/components/SEO';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { handleStartAssessment } = useAssessment();
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  // Check if this is a password reset flow
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    
    // Also check hash fragment for tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashAccessToken = hashParams.get('access_token');
    const hashRefreshToken = hashParams.get('refresh_token');
    const hashType = hashParams.get('type');
    
    // Log all URL parameters for debugging
    console.log('Index: URL parameters:', Object.fromEntries(urlParams.entries()));
    console.log('Index: Hash parameters:', Object.fromEntries(hashParams.entries()));
    
    // Check for various password reset URL formats
    const isPasswordReset = (
      (accessToken && refreshToken && type === 'recovery') ||
      (accessToken && type === 'recovery') ||
      (hashAccessToken && hashRefreshToken && hashType === 'recovery') ||
      (hashAccessToken && hashType === 'recovery') ||
      urlParams.has('error_description') && urlParams.get('error_description')?.includes('password')
    );
    
    if (isPasswordReset) {
      console.log('Index: Password reset flow detected, redirecting to reset page');
      // Preserve the URL parameters when redirecting
      const currentUrl = window.location.href;
      const resetUrl = currentUrl.replace('/?', '/reset-password?').replace('/#', '/reset-password#');
      window.location.href = resetUrl;
    }
  }, [navigate]);

  // Wait for auth to initialize before rendering
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
          <p className="mt-2 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Leader Leap Assessment Tool - Leadership Competency Gap Analysis"
        description="Identify and close leadership competency gaps with our comprehensive assessment tool. Evaluate 11 key leadership areas including strategic thinking, emotional intelligence, and team building."
        keywords="leadership assessment, competency gap analysis, leadership development, strategic thinking, emotional intelligence, team building, change management, decision making, delegation, negotiation, self-leadership"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Leader Leap Assessment Tool",
          "description": "Comprehensive leadership competency gap analysis tool that evaluates 11 key leadership areas including strategic thinking, emotional intelligence, and team building.",
          "url": "https://leader-leap.com/",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "provider": {
            "@type": "Organization",
            "name": "Encourager Coaching",
            "url": "https://www.encouragercoaching.com"
          },
          "featureList": [
            "Leadership Assessment",
            "Competency Gap Analysis", 
            "Strategic Thinking Evaluation",
            "Emotional Intelligence Assessment",
            "Team Building Analysis",
            "Change Management Evaluation",
            "Decision Making Assessment",
            "Delegation & Empowerment Analysis",
            "Negotiation & Conflict Resolution",
            "Self-Leadership Planning",
            "Results Dashboard & Insights"
          ]
        }}
      />
      <div className="min-h-screen bg-slate-50">
        <div className={`mx-auto ${isMobile ? 'w-full px-2 py-2 overflow-hidden' : 'max-w-5xl px-4 py-2'}`}>
          <Navigation />
        </div>
        <main className={`assessment-container mx-auto ${isMobile ? 'w-full px-2 py-6 overflow-hidden' : 'max-w-5xl px-4 py-8'}`}>
          <IntroductionPage 
            categories={allCategories}
            onStartAssessment={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
